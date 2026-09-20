import { generateReferenceNumber, normalizePagination, buildPaginationMeta } from "@car-platform/utils";
import { AppError } from "../../errors/app-error.js";
import type { BookingStatus } from "../../generated/prisma/client.js";
import { businessRepository, timeStringToDate } from "../business/business.repository.js";
import { serviceRepository } from "../service/service.repository.js";
import { vehicleRepository } from "../vehicle/vehicle.repository.js";
import { bookingRepository } from "./booking.repository.js";
import type {
  BookingListQueryInput,
  BookingStatusUpdateInput,
  CreateBookingInput,
} from "./booking.validation.js";

type ActorRole = "CUSTOMER" | "ADMIN" | "SUPER_ADMIN";

const ALLOWED_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  PENDING: ["CONFIRMED", "REJECTED", "CANCELLED"],
  CONFIRMED: ["ARRIVED", "CANCELLED", "NO_SHOW"],
  ARRIVED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [],
  REJECTED: [],
};

const MAX_BOOKING_NUMBER_ATTEMPTS = 5;

const generateUniqueBookingNumber = async (): Promise<string> => {
  for (let attempt = 0; attempt < MAX_BOOKING_NUMBER_ATTEMPTS; attempt += 1) {
    const candidate = generateReferenceNumber("BK");
    if (!(await bookingRepository.bookingNumberExists(candidate))) {
      return candidate;
    }
  }
  throw new AppError(500, "Could not generate a unique booking number");
};

const addMinutes = (date: Date, minutes: number): Date =>
  new Date(date.getTime() + minutes * 60_000);

const dayOfWeek = (date: Date): number => date.getUTCDay();

export const bookingService = {
  async create(userId: string, input: CreateBookingInput) {
    const customerId = await bookingRepository.findCustomerIdByUserId(userId);
    if (!customerId) {
      throw new AppError(403, "Only customer accounts can create bookings");
    }

    const business = await businessRepository.findById(input.businessId);
    if (!business || business.status !== "ACTIVE") {
      throw new AppError(400, "Business is not available for booking");
    }

    const branch = await businessRepository.findBranchById(input.branchId);
    if (!branch || branch.businessId !== input.businessId) {
      throw new AppError(400, "Branch does not belong to this business");
    }
    if (branch.status !== "ACTIVE") {
      throw new AppError(400, "Branch is not accepting bookings");
    }

    const service = await serviceRepository.findById(input.serviceId);
    if (!service || service.businessId !== input.businessId) {
      throw new AppError(400, "Service does not belong to this business");
    }
    if (!service.isActive || !service.isOnlineBooking) {
      throw new AppError(400, "Service is not available for online booking");
    }
    if (service.branchId && service.branchId !== input.branchId) {
      throw new AppError(400, "Service is not offered at this branch");
    }

    const vehicle = await vehicleRepository.findById(input.vehicleId);
    if (!vehicle || vehicle.customerId !== customerId) {
      throw new AppError(400, "Vehicle not found");
    }

    const startTime = timeStringToDate(input.startTime);
    const endTime = addMinutes(startTime, service.durationMinutes);

    const holiday = branch.holidays.find(
      (h) => h.date.toDateString() === input.scheduledDate.toDateString(),
    );
    if (holiday) {
      throw new AppError(400, "Branch is closed on the selected date");
    }

    // A branch with no configured hours for that weekday hasn't opted into
    // enforcing hours yet, so booking is allowed; a configured row is
    // authoritative (closed day, or outside the opening/closing window).
    const hoursForDay = branch.hours.find(
      (h) => h.dayOfWeek === dayOfWeek(input.scheduledDate),
    );
    if (hoursForDay) {
      if (hoursForDay.isClosed) {
        throw new AppError(400, "Branch is closed on the selected day");
      }
      if (
        hoursForDay.openingTime &&
        hoursForDay.closingTime &&
        (startTime < hoursForDay.openingTime || endTime > hoursForDay.closingTime)
      ) {
        throw new AppError(400, "Selected time is outside branch operating hours");
      }
    }

    const overlapping = await bookingRepository.findOverlapping(
      input.branchId,
      input.scheduledDate,
      startTime,
      endTime,
    );
    if (overlapping) {
      throw new AppError(409, "This time slot is no longer available");
    }

    const bookingNumber = await generateUniqueBookingNumber();

    return bookingRepository.create({
      bookingNumber,
      customerId,
      businessId: input.businessId,
      branchId: input.branchId,
      vehicleId: input.vehicleId,
      serviceId: input.serviceId,
      scheduledDate: input.scheduledDate,
      startTime,
      endTime,
      estimatedPrice: service.basePrice,
      currency: service.currency,
      customerNotes: input.customerNotes,
      status: "PENDING",
    });
  },

  async listMine(userId: string, query: BookingListQueryInput) {
    const customerId = await bookingRepository.findCustomerIdByUserId(userId);
    if (!customerId) {
      throw new AppError(403, "Only customer accounts have bookings");
    }
    const { page, limit, skip, take } = normalizePagination(query);
    const { items, total } = await bookingRepository.listByCustomer(
      customerId,
      query,
      skip,
      take,
    );
    return { items, meta: buildPaginationMeta(page, limit, total) };
  },

  async listForBusiness(userId: string, query: BookingListQueryInput) {
    const adminId = await bookingRepository.findAdminIdByUserId(userId);
    if (!adminId) {
      throw new AppError(403, "Only admin accounts manage bookings");
    }
    const { page, limit, skip, take } = normalizePagination(query);
    const { items, total } = await bookingRepository.listByAdmin(
      adminId,
      query,
      skip,
      take,
    );
    return { items, meta: buildPaginationMeta(page, limit, total) };
  },

  async getById(userId: string, role: ActorRole, bookingId: string) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) {
      throw new AppError(404, "Booking not found");
    }
    this.assertVisible(booking, userId, role);
    return booking;
  },

  assertVisible(
    booking: NonNullable<Awaited<ReturnType<typeof bookingRepository.findById>>>,
    userId: string,
    role: ActorRole,
  ) {
    if (role === "SUPER_ADMIN") return;
    if (role === "CUSTOMER" && booking.customer.userId === userId) return;
    if (role === "ADMIN" && booking.business.admin.userId === userId) return;
    throw new AppError(403, "You cannot view this booking");
  },

  async updateStatus(
    userId: string,
    role: ActorRole,
    bookingId: string,
    input: BookingStatusUpdateInput,
  ) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) {
      throw new AppError(404, "Booking not found");
    }

    if (role === "CUSTOMER") {
      if (booking.customer.userId !== userId) {
        throw new AppError(403, "You cannot manage this booking");
      }
      if (input.status !== "CANCELLED") {
        throw new AppError(403, "Customers may only cancel a booking");
      }
    } else if (role === "ADMIN") {
      if (booking.business.admin.userId !== userId) {
        throw new AppError(403, "You cannot manage this booking");
      }
    }

    if (!ALLOWED_TRANSITIONS[booking.status].includes(input.status)) {
      throw new AppError(
        400,
        `Cannot change booking status from ${booking.status} to ${input.status}`,
      );
    }

    const extra: Record<string, unknown> = {};
    if (input.businessNotes !== undefined) {
      extra.businessNotes = input.businessNotes;
    }
    if (input.status === "CONFIRMED") {
      extra.confirmedAt = new Date();
    }
    if (input.status === "COMPLETED") {
      extra.completedAt = new Date();
      extra.finalPrice = input.finalPrice ?? booking.estimatedPrice;
    }
    if (input.status === "CANCELLED" || input.status === "REJECTED") {
      extra.cancelledAt = new Date();
      if (input.reason) {
        extra.cancellationReason = input.reason;
      }
    }

    return bookingRepository.transitionStatus(
      bookingId,
      userId,
      booking.status,
      input.status,
      input.reason,
      extra,
    );
  },

  async listHistory(userId: string, role: ActorRole, bookingId: string) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) {
      throw new AppError(404, "Booking not found");
    }
    this.assertVisible(booking, userId, role);
    return bookingRepository.listHistory(bookingId);
  },
};
