import type { Request, Response } from "express";
import { UserRole } from "../../generated/prisma/client.js";
import { requireParam, requireUserId } from "../../utils/request.js";
import { reviewService } from "./review.service.js";
import type {
  BusinessReviewListQueryInput,
  CreateBusinessReviewInput,
  CreateProductReviewInput,
  ProductReviewListQueryInput,
  ReplyToReviewInput,
  ReviewStatusUpdateInput,
} from "./review.validation.js";

export const createBusinessReview = async (req: Request, res: Response) => {
  const review = await reviewService.createBusinessReview(
    requireUserId(req),
    req.body as CreateBusinessReviewInput,
  );
  res.status(201).json({ review });
};

export const listBusinessReviews = async (req: Request, res: Response) => {
  const includeAllStatuses =
    req.user?.role === UserRole.ADMIN || req.user?.role === UserRole.SUPER_ADMIN;
  const result = await reviewService.listBusinessReviews(
    req.validatedQuery as unknown as BusinessReviewListQueryInput,
    includeAllStatuses,
  );
  res.status(200).json(result);
};

export const replyToBusinessReview = async (req: Request, res: Response) => {
  const review = await reviewService.replyToBusinessReview(
    requireUserId(req),
    requireParam(req, "reviewId"),
    req.body as ReplyToReviewInput,
  );
  res.status(200).json({ review });
};

export const setBusinessReviewStatus = async (req: Request, res: Response) => {
  const review = await reviewService.setBusinessReviewStatus(
    requireParam(req, "reviewId"),
    req.body as ReviewStatusUpdateInput,
  );
  res.status(200).json({ review });
};

export const createProductReview = async (req: Request, res: Response) => {
  const review = await reviewService.createProductReview(
    requireUserId(req),
    req.body as CreateProductReviewInput,
  );
  res.status(201).json({ review });
};

export const listProductReviews = async (req: Request, res: Response) => {
  const includeAllStatuses =
    req.user?.role === UserRole.ADMIN || req.user?.role === UserRole.SUPER_ADMIN;
  const result = await reviewService.listProductReviews(
    req.validatedQuery as unknown as ProductReviewListQueryInput,
    includeAllStatuses,
  );
  res.status(200).json(result);
};

export const setProductReviewStatus = async (req: Request, res: Response) => {
  const review = await reviewService.setProductReviewStatus(
    requireParam(req, "reviewId"),
    req.body as ReviewStatusUpdateInput,
  );
  res.status(200).json({ review });
};
