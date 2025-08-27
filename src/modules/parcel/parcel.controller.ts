import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { ParcelService } from "./parcel.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { JwtPayload } from "jsonwebtoken";
import { UserRole } from "../user/user.interface";
import { IParcel } from "./parcel.interface";

const createParcel = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;

  const payload: IParcel = {
    ...req.body,
    sender: user.userId,
    images: (req.files as Express.Multer.File[])?.map((file) => file.path),
  }; // Use user.userId
  const parcel = await ParcelService.createParcel(payload);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Parcel created successfully",
    data: parcel,
  });
});

const getUserParcels = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;

  const convertedQuery: Record<string, any> = {};
  for (const [key, value] of Object.entries(req.query)) {
    if (typeof value === "string") {
      convertedQuery[key] = value;
    } else if (Array.isArray(value)) {
      convertedQuery[key] = value.join(",");
    }
  }

  const parcels = await ParcelService.getUserParcels(
    user.userId,
    user.role as UserRole,
    convertedQuery
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Parcels retrieved successfully",
    data: parcels,
  });
});

const getParcelDetails = catchAsync(async (req: Request, res: Response) => {
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

const updateParcel = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;

  // Copy body into updateData
  const updateData: Partial<IParcel> & { deleteImages?: string[] } = {
    ...req.body,
  };

  // Convert deleteImages to an array (handle string or JSON)
  if (req.body.deleteImages) {
    try {
      // Support both array and stringified JSON
      updateData.deleteImages = Array.isArray(req.body.deleteImages)
        ? req.body.deleteImages
        : JSON.parse(req.body.deleteImages);
    } catch {
      updateData.deleteImages = [req.body.deleteImages];
    }
  }

  // Handle new uploaded files (Cloudinary URLs)
  if (req.files && Array.isArray(req.files)) {
    const uploadedImages = (req.files as Express.Multer.File[]).map(
      (file) => file.path // CloudinaryStorage sets .path to URL
    );

    // Merge with body.images if provided
    updateData.images = [...(updateData.images || []), ...uploadedImages];
  }

  const updatedParcel = await ParcelService.updateParcel(
    req.params.id,
    user.userId,
    updateData
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Parcel updated successfully",
    data: updatedParcel,
  });
});

const cancelParcel = catchAsync(async (req: Request, res: Response) => {
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
  const user = req.user as JwtPayload;
  const { status, location, note } = req.body;

  const parcel = await ParcelService.updateParcelStatus(
    req.params.id,
    status,
    user.userId,
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
  updateParcel,
  cancelParcel,
  confirmDelivery,
  updateStatus,
  getAllParcels,
  trackParcel,
};
