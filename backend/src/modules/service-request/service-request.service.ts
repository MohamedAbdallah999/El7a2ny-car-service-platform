import {
  buildPaginationMeta,
  generateReferenceNumber,
  normalizePagination,
} from "@car-platform/utils";
import { AppError } from "../../errors/app-error.js";
import type { ServiceRequestStatus, UserRole } from "../../generated/prisma/client.js";
import { businessRepository } from "../business/business.repository.js";
import { vehicleRepository } from "../vehicle/vehicle.repository.js";
import { serviceRequestRepository } from "./service-request.repository.js";
import type {
  CreateAttachmentInput,
  CreateMessageInput,
  CreateServiceRequestInput,
  ServiceRequestListQueryInput,
  ServiceRequestStatusUpdateInput,
} from "./service-request.validation.js";

const ALLOWED_TRANSITIONS: Record<ServiceRequestStatus, ServiceRequestStatus[]> = {
  PENDING: ["REVIEWING", "REJECTED", "CANCELLED"],
  REVIEWING: ["QUOTED", "REJECTED", "CANCELLED"],
  QUOTED: ["APPROVED", "REJECTED", "CANCELLED"],
  APPROVED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
  REJECTED: [],
};

// Customers may only move a request toward these end states themselves
// (withdrawing, or accepting/declining a quote); every forward-progress
// transition (reviewing it, quoting it, starting/finishing the work) is the
// business's call.
const CUSTOMER_ALLOWED_TARGETS: ServiceRequestStatus[] = [
  "CANCELLED",
  "APPROVED",
  "REJECTED",
];

const MAX_NUMBER_ATTEMPTS = 5;

const generateUniqueRequestNumber = async (): Promise<string> => {
  for (let attempt = 0; attempt < MAX_NUMBER_ATTEMPTS; attempt += 1) {
    const candidate = generateReferenceNumber("SR");
    if (!(await serviceRequestRepository.requestNumberExists(candidate))) {
      return candidate;
    }
  }
  throw new AppError(500, "Could not generate a unique request number");
};

export const serviceRequestService = {
  async create(userId: string, input: CreateServiceRequestInput) {
    const customerId = await serviceRequestRepository.findCustomerIdByUserId(
      userId,
    );
    if (!customerId) {
      throw new AppError(403, "Only customer accounts can create service requests");
    }

    const vehicle = await vehicleRepository.findById(input.vehicleId);
    if (!vehicle || vehicle.customerId !== customerId) {
      throw new AppError(400, "Vehicle not found");
    }

    if (input.businessId) {
      const business = await businessRepository.findById(input.businessId);
      if (!business || business.status !== "ACTIVE") {
        throw new AppError(400, "Business is not available");
      }
    }

    const requestNumber = await generateUniqueRequestNumber();

    return serviceRequestRepository.create({
      requestNumber,
      customerId,
      vehicleId: input.vehicleId,
      businessId: input.businessId,
      branchId: input.branchId,
      serviceId: input.serviceId,
      title: input.title,
      description: input.description,
      priority: input.priority,
      status: "PENDING",
    });
  },

  async listMine(userId: string, query: ServiceRequestListQueryInput) {
    const customerId = await serviceRequestRepository.findCustomerIdByUserId(
      userId,
    );
    if (!customerId) {
      throw new AppError(403, "Only customer accounts have service requests");
    }
    const { page, limit, skip, take } = normalizePagination(query);
    const { items, total } = await serviceRequestRepository.listByCustomer(
      customerId,
      query,
      skip,
      take,
    );
    return { items, meta: buildPaginationMeta(page, limit, total) };
  },

  async listForBusiness(userId: string, query: ServiceRequestListQueryInput) {
    const adminId = await serviceRequestRepository.findAdminIdByUserId(userId);
    if (!adminId) {
      throw new AppError(403, "Only admin accounts manage service requests");
    }
    const { page, limit, skip, take } = normalizePagination(query);
    const { items, total } = await serviceRequestRepository.listByAdmin(
      adminId,
      query,
      skip,
      take,
    );
    return { items, meta: buildPaginationMeta(page, limit, total) };
  },

  assertVisible(
    request: NonNullable<
      Awaited<ReturnType<typeof serviceRequestRepository.findById>>
    >,
    userId: string,
    role: UserRole,
  ) {
    if (role === "SUPER_ADMIN") return;
    if (role === "CUSTOMER" && request.customer.userId === userId) return;
    if (role === "ADMIN" && request.business?.admin.userId === userId) return;
    throw new AppError(403, "You cannot view this service request");
  },

  async getById(userId: string, role: UserRole, requestId: string) {
    const request = await serviceRequestRepository.findById(requestId);
    if (!request) {
      throw new AppError(404, "Service request not found");
    }
    this.assertVisible(request, userId, role);
    return request;
  },

  async updateStatus(
    userId: string,
    role: UserRole,
    requestId: string,
    input: ServiceRequestStatusUpdateInput,
  ) {
    const request = await serviceRequestRepository.findById(requestId);
    if (!request) {
      throw new AppError(404, "Service request not found");
    }

    if (role === "CUSTOMER") {
      if (request.customer.userId !== userId) {
        throw new AppError(403, "You cannot manage this service request");
      }
      if (!CUSTOMER_ALLOWED_TARGETS.includes(input.status)) {
        throw new AppError(403, "Customers may only accept, decline, or cancel a request");
      }
    } else if (role === "ADMIN") {
      if (!request.business || request.business.admin.userId !== userId) {
        throw new AppError(403, "You cannot manage this service request");
      }
    }

    if (!ALLOWED_TRANSITIONS[request.status].includes(input.status)) {
      throw new AppError(
        400,
        `Cannot change request status from ${request.status} to ${input.status}`,
      );
    }
    if (input.status === "QUOTED" && input.estimatedPrice === undefined) {
      throw new AppError(400, "A quote requires an estimated price");
    }
    if (input.status === "COMPLETED" && input.finalPrice === undefined) {
      throw new AppError(400, "Completing a request requires a final price");
    }

    const data: Record<string, unknown> = { status: input.status };
    if (input.estimatedPrice !== undefined) {
      data.estimatedPrice = input.estimatedPrice;
    }
    if (input.finalPrice !== undefined) {
      data.finalPrice = input.finalPrice;
    }
    if (input.status === "COMPLETED") {
      data.completedAt = new Date();
    }
    if (input.status === "CANCELLED" || input.status === "REJECTED") {
      data.cancelledAt = new Date();
    }

    return serviceRequestRepository.update(requestId, data);
  },

  async addMessage(
    userId: string,
    role: UserRole,
    requestId: string,
    input: CreateMessageInput,
  ) {
    const request = await serviceRequestRepository.findById(requestId);
    if (!request) {
      throw new AppError(404, "Service request not found");
    }
    this.assertVisible(request, userId, role);
    return serviceRequestRepository.createMessage(
      requestId,
      userId,
      input.message,
    );
  },

  async listMessages(userId: string, role: UserRole, requestId: string) {
    const request = await serviceRequestRepository.findById(requestId);
    if (!request) {
      throw new AppError(404, "Service request not found");
    }
    this.assertVisible(request, userId, role);
    return serviceRequestRepository.listMessages(requestId);
  },

  async addAttachment(
    userId: string,
    role: UserRole,
    requestId: string,
    input: CreateAttachmentInput,
  ) {
    const request = await serviceRequestRepository.findById(requestId);
    if (!request) {
      throw new AppError(404, "Service request not found");
    }
    this.assertVisible(request, userId, role);
    return serviceRequestRepository.createAttachment(requestId, input);
  },

  async listAttachments(userId: string, role: UserRole, requestId: string) {
    const request = await serviceRequestRepository.findById(requestId);
    if (!request) {
      throw new AppError(404, "Service request not found");
    }
    this.assertVisible(request, userId, role);
    return serviceRequestRepository.listAttachments(requestId);
  },
};
