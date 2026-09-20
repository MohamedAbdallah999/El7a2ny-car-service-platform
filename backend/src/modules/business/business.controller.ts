import type { Request, Response } from "express";
import { UserRole } from "../../generated/prisma/client.js";
import { requireParam, requireUserId } from "../../utils/request.js";
import { businessService } from "./business.service.js";
import type {
  BusinessHoursInput,
  BusinessListQueryInput,
  BusinessStatusInput,
  BusinessVerificationInput,
  CreateBranchInput,
  CreateBusinessInput,
  CreateDocumentInput,
  CreateHolidayInput,
  ReviewDocumentInput,
  UpdateBranchInput,
  UpdateBusinessInput,
} from "./business.validation.js";

export const createBusiness = async (req: Request, res: Response) => {
  const business = await businessService.create(
    requireUserId(req),
    req.body as CreateBusinessInput,
  );
  res.status(201).json({ business });
};

export const listPublicBusinesses = async (req: Request, res: Response) => {
  const result = await businessService.listPublic(
    req.validatedQuery as unknown as BusinessListQueryInput,
  );
  res.status(200).json(result);
};

export const getBusinessBySlug = async (req: Request, res: Response) => {
  const business = await businessService.getBySlug(
    requireParam(req, "slug"),
  );
  res.status(200).json({ business });
};

export const listMyBusinesses = async (req: Request, res: Response) => {
  const result = await businessService.listMine(
    requireUserId(req),
    req.validatedQuery as unknown as BusinessListQueryInput,
  );
  res.status(200).json(result);
};

export const listAllBusinesses = async (req: Request, res: Response) => {
  const result = await businessService.listAll(
    req.validatedQuery as unknown as BusinessListQueryInput & {
      verificationStatus?: string;
    },
  );
  res.status(200).json(result);
};

export const getBusinessById = async (req: Request, res: Response) => {
  const business = await businessService.getById(
    requireParam(req, "businessId"),
  );
  res.status(200).json({ business });
};

export const updateBusiness = async (req: Request, res: Response) => {
  const business = await businessService.update(
    requireUserId(req),
    requireParam(req, "businessId"),
    req.body as UpdateBusinessInput,
  );
  res.status(200).json({ business });
};

export const setBusinessVerification = async (req: Request, res: Response) => {
  const business = await businessService.setVerification(
    requireParam(req, "businessId"),
    req.body as BusinessVerificationInput,
  );
  res.status(200).json({ business });
};

export const setBusinessStatus = async (req: Request, res: Response) => {
  const business = await businessService.setStatus(
    requireParam(req, "businessId"),
    req.body as BusinessStatusInput,
  );
  res.status(200).json({ business });
};

export const createBranch = async (req: Request, res: Response) => {
  const branch = await businessService.createBranch(
    requireUserId(req),
    requireParam(req, "businessId"),
    req.body as CreateBranchInput,
  );
  res.status(201).json({ branch });
};

export const listBranches = async (req: Request, res: Response) => {
  const branches = await businessService.listBranches(
    requireParam(req, "businessId"),
  );
  res.status(200).json({ branches });
};

export const updateBranch = async (req: Request, res: Response) => {
  const branch = await businessService.updateBranch(
    requireUserId(req),
    requireParam(req, "branchId"),
    req.body as UpdateBranchInput,
  );
  res.status(200).json({ branch });
};

export const closeBranch = async (req: Request, res: Response) => {
  await businessService.closeBranch(
    requireUserId(req),
    requireParam(req, "branchId"),
  );
  res.status(204).send();
};

export const setBranchHours = async (req: Request, res: Response) => {
  const hours = await businessService.setHours(
    requireUserId(req),
    requireParam(req, "branchId"),
    req.body as BusinessHoursInput,
  );
  res.status(200).json({ hours });
};

export const addHoliday = async (req: Request, res: Response) => {
  const holiday = await businessService.addHoliday(
    requireUserId(req),
    requireParam(req, "branchId"),
    req.body as CreateHolidayInput,
  );
  res.status(201).json({ holiday });
};

export const listHolidays = async (req: Request, res: Response) => {
  const holidays = await businessService.listHolidays(
    requireParam(req, "branchId"),
  );
  res.status(200).json({ holidays });
};

export const removeHoliday = async (req: Request, res: Response) => {
  await businessService.removeHoliday(
    requireUserId(req),
    requireParam(req, "holidayId"),
  );
  res.status(204).send();
};

export const addDocument = async (req: Request, res: Response) => {
  const document = await businessService.addDocument(
    requireUserId(req),
    requireParam(req, "businessId"),
    req.body as CreateDocumentInput,
  );
  res.status(201).json({ document });
};

export const listDocuments = async (req: Request, res: Response) => {
  const documents = await businessService.listDocuments(
    requireUserId(req),
    requireParam(req, "businessId"),
    req.user?.role === UserRole.SUPER_ADMIN,
  );
  res.status(200).json({ documents });
};

export const reviewDocument = async (req: Request, res: Response) => {
  const document = await businessService.reviewDocument(
    requireUserId(req),
    requireParam(req, "documentId"),
    req.body as ReviewDocumentInput,
  );
  res.status(200).json({ document });
};
