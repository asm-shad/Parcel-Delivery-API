import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { ParcelService } from "./parcel.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { JwtPayload } from "jsonwebtoken";
import { UserRole } from "../user/user.interface";

const createParcel = catchAsync(async (req: Request, res: Response) => {
  // Apply booking pattern: cast to JwtPayload first
  const user = req.user as JwtPayload;

  const payload = { ...req.body, sender: user.userId }; // Use user.userId
  const parcel = await ParcelService.createParcel(payload);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Parcel created successfully",
    data: parcel,
  });
});

const getUserParcels = catchAsync(async (req: Request, res: Response) => {
  // Apply booking pattern: cast to JwtPayload first
  const user = req.user as JwtPayload;

  const parcels = await ParcelService.getParcelsForUser(
    user.userId,
    user.role as UserRole
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Parcels retrieved successfully",
    data: parcels,
  });
});

const getParcelDetails = catchAsync(async (req: Request, res: Response) => {
  // Apply booking pattern: cast to JwtPayload first
  const user = req.user as JwtPayload;

  const parcel = await ParcelService.getSingleParcel(
    req.params.id,
    user.userId,
    user.role as UserRole
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Parcel details retrieved",
    data: parcel,
  });
});

const cancelParcel = catchAsync(async (req: Request, res: Response) => {
  // Apply booking pattern: cast to JwtPayload first
  const user = req.user as JwtPayload;

  const parcel = await ParcelService.cancelParcel(req.params.id, user.userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Parcel cancelled successfully",
    data: parcel,
  });
});

const confirmDelivery = catchAsync(async (req: Request, res: Response) => {
  // Apply booking pattern: cast to JwtPayload first
  const user = req.user as JwtPayload;

  const parcel = await ParcelService.confirmDelivery(
    req.params.id,
    user.userId
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Delivery confirmed successfully",
    data: parcel,
  });
});

const updateStatus = catchAsync(async (req: Request, res: Response) => {
  // Apply booking pattern: cast to JwtPayload first
  const user = req.user as JwtPayload;
  const { status, location, note } = req.body;

  const parcel = await ParcelService.updateParcelStatus(
    req.params.id,
    status,
    user.userId, // Use user.userId
    location,
    note
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Parcel status updated",
    data: parcel,
  });
});

const getAllParcels = catchAsync(async (req: Request, res: Response) => {
  // Create a new query object with only string values
  const convertedQuery: Record<string, string> = {};

  for (const [key, value] of Object.entries(req.query)) {
    if (typeof value === "string") {
      convertedQuery[key] = value;
    } else if (Array.isArray(value)) {
      convertedQuery[key] = value.join(",");
    }
  }

  const { data, meta } = await ParcelService.getAllParcels(convertedQuery);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "All parcels retrieved",
    data,
    meta,
  });
});

const trackParcel = catchAsync(async (req: Request, res: Response) => {
  const trackingInfo = await ParcelService.getTrackingInfo(
    req.params.trackingId
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Tracking information retrieved",
    data: trackingInfo,
  });
});

export const ParcelController = {
  createParcel,
  getUserParcels,
  getParcelDetails,
  cancelParcel,
  confirmDelivery,
  updateStatus,
  getAllParcels,
  trackParcel,
};
