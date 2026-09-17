import type { Request, Response } from "express";
import { AppError } from "../../errors/app-error.js";
import { requireParam, requireUserId } from "../../utils/request.js";
import { bookingService } from "./booking.service.js";
import type {
  BookingListQueryInput,
  BookingStatusUpdateInput,
  CreateBookingInput,
} from "./booking.validation.js";

const requireRole = (req: Request) => {
  const role = req.user?.role;
  if (!role) {
    throw new AppError(401, "Unauthorized");
  }
  return role;
};

export const createBooking = async (req: Request, res: Response) => {
  const booking = await bookingService.create(
    requireUserId(req),
    req.body as CreateBookingInput,
  );
  res.status(201).json({ booking });
};

export const listMyBookings = async (req: Request, res: Response) => {
  const result = await bookingService.listMine(
    requireUserId(req),
    req.validatedQuery as unknown as BookingListQueryInput,
  );
  res.status(200).json(result);
};

export const listBusinessBookings = async (req: Request, res: Response) => {
  const result = await bookingService.listForBusiness(
    requireUserId(req),
    req.validatedQuery as unknown as BookingListQueryInput,
  );
  res.status(200).json(result);
};

export const getBooking = async (req: Request, res: Response) => {
  const booking = await bookingService.getById(
    requireUserId(req),
    requireRole(req),
    requireParam(req, "bookingId"),
  );
  res.status(200).json({ booking });
};

export const updateBookingStatus = async (req: Request, res: Response) => {
  const booking = await bookingService.updateStatus(
    requireUserId(req),
    requireRole(req),
    requireParam(req, "bookingId"),
    req.body as BookingStatusUpdateInput,
  );
  res.status(200).json({ booking });
};

export const listBookingHistory = async (req: Request, res: Response) => {
  const history = await bookingService.listHistory(
    requireUserId(req),
    requireRole(req),
    requireParam(req, "bookingId"),
  );
  res.status(200).json({ history });
};
