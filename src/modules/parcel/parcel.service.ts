import { QueryBuilder } from "../../utils/QueryBuilder";
import { IParcel, ITrackingEvent, ParcelStatus } from "./parcel.interface";
import Parcel from "./parcel.model";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";
import { Types } from "mongoose";
import { UserRole } from "../user/user.interface";
import { User } from "../user/user.model";

// Generate unique tracking ID
const generateTrackingId = (): string => {
  const now = new Date();
  const datePart = `${now.getFullYear()}${(now.getMonth() + 1)
    .toString()
    .padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}`;
  const randomPart = Math.floor(100000 + Math.random() * 900000);
  return `TRK-${datePart}-${randomPart}`;
};

const createParcel = async (payload: IParcel): Promise<IParcel> => {
  payload.trackingId = generateTrackingId();
  payload.currentStatus = ParcelStatus.Requested;

  // Create initial tracking event
  const initialEvent: ITrackingEvent = {
    status: ParcelStatus.Requested,
    timestamp: new Date(),
    location: payload.senderAddress,
    updatedBy: payload.sender,
    note: "Parcel created",
  };

  // ✅ Update sender role if it's RECEIVER (keep it as RECEIVER)
  const senderUser = await User.findById(payload.sender);
  if (senderUser?.role === UserRole.RECEIVER) {
    // No role change needed, stays RECEIVER
  }

  // ✅ Update receiver role if it's SENDER → change to RECEIVER
  const receiverUser = await User.findById(payload.receiver);
  if (receiverUser?.role === UserRole.SENDER) {
    receiverUser.role = UserRole.RECEIVER;
    await receiverUser.save();
  }

  payload.trackingEvents = [initialEvent];

  return await Parcel.create(payload);
};

const getParcelsForUser = async (
  userId: string,
  role: UserRole
): Promise<IParcel[]> => {
  let filter = {};

  if (role === UserRole.SENDER) {
    filter = { sender: userId };
  } else if (role === UserRole.RECEIVER) {
    filter = { receiver: userId };
  }

  return await Parcel.find(filter).sort("-createdAt");
};

const getSingleParcel = async (
  parcelId: string,
  userId: string,
  role: UserRole
): Promise<IParcel> => {
  const parcel = await Parcel.findById(parcelId);

  if (!parcel) {
    throw new AppError(httpStatus.NOT_FOUND, "Parcel not found");
  }

  // Authorization check
  if (
    role !== UserRole.ADMIN &&
    role !== UserRole.SUPER_ADMIN &&
    parcel.sender.toString() !== userId &&
    parcel.receiver.toString() !== userId
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Not authorized to view this parcel"
    );
  }

  return parcel;
};

const cancelParcel = async (
  parcelId: string,
  userId: string
): Promise<IParcel> => {
  const parcel = await Parcel.findById(parcelId);

  if (!parcel) {
    throw new AppError(httpStatus.NOT_FOUND, "Parcel not found");
  }

  // Authorization and status check
  if (parcel.sender.toString() !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Not authorized to cancel this parcel"
    );
  }

  if (parcel.currentStatus !== ParcelStatus.Requested) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Cannot cancel parcel after approval"
    );
  }

  // Create cancellation event
  const cancelEvent: ITrackingEvent = {
    status: ParcelStatus.Cancelled,
    timestamp: new Date(),
    location: parcel.senderAddress,
    updatedBy: new Types.ObjectId(userId),
    note: "Parcel cancelled by sender",
  };

  parcel.trackingEvents.push(cancelEvent);
  parcel.currentStatus = ParcelStatus.Cancelled;
  parcel.isCancelled = true;

  return await parcel.save();
};

const confirmDelivery = async (
  parcelId: string,
  userId: string
): Promise<IParcel> => {
  const parcel = await Parcel.findById(parcelId);

  if (!parcel) {
    throw new AppError(httpStatus.NOT_FOUND, "Parcel not found");
  }

  // Authorization check
  if (parcel.receiver.toString() !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Not authorized to confirm delivery"
    );
  }

  // Status validation
  if (parcel.currentStatus !== ParcelStatus.InTransit) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Parcel must be in transit before delivery confirmation"
    );
  }

  // Create delivery event
  const deliveryEvent: ITrackingEvent = {
    status: ParcelStatus.Delivered,
    timestamp: new Date(),
    location: parcel.receiverAddress,
    updatedBy: new Types.ObjectId(userId),
    note: "Parcel delivered",
  };

  parcel.trackingEvents.push(deliveryEvent);
  parcel.currentStatus = ParcelStatus.Delivered;
  parcel.isDelivered = true;
  parcel.deliveredAt = new Date();

  return await parcel.save();
};

const updateParcelStatus = async (
  parcelId: string,
  status: ParcelStatus,
  adminId: string,
  location: string,
  note?: string
): Promise<IParcel> => {
  const parcel = await Parcel.findById(parcelId);

  if (!parcel) {
    throw new AppError(httpStatus.NOT_FOUND, "Parcel not found");
  }

  // Status transition validation
  const validTransitions: Record<ParcelStatus, ParcelStatus[]> = {
    [ParcelStatus.Requested]: [ParcelStatus.Approved, ParcelStatus.Cancelled],
    [ParcelStatus.Approved]: [ParcelStatus.Dispatched, ParcelStatus.Blocked],
    [ParcelStatus.Dispatched]: [ParcelStatus.InTransit, ParcelStatus.Blocked],
    [ParcelStatus.InTransit]: [ParcelStatus.Delivered, ParcelStatus.Blocked],
    [ParcelStatus.Delivered]: [],
    [ParcelStatus.Cancelled]: [],
    [ParcelStatus.Blocked]: [ParcelStatus.Approved],
  };

  if (!validTransitions[parcel.currentStatus].includes(status)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Invalid status transition from ${parcel.currentStatus} to ${status}`
    );
  }

  // Create status update event
  const statusEvent: ITrackingEvent = {
    status,
    timestamp: new Date(),
    location,
    updatedBy: new Types.ObjectId(adminId),
    note: note || `Status updated to ${status}`,
  };

  parcel.trackingEvents.push(statusEvent);
  parcel.currentStatus = status;

  // Update flags based on status
  if (status === ParcelStatus.Blocked) {
    parcel.isBlocked = true;
  } else if (status === ParcelStatus.Approved && parcel.isBlocked) {
    parcel.isBlocked = false;
  }

  return await parcel.save();
};

const getAllParcels = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(Parcel.find(), query);

  const parcels = await queryBuilder
    .search(["trackingId", "senderAddress", "receiverAddress"])
    .filter()
    .sort()
    .fields()
    .paginate();

  const [data, meta] = await Promise.all([
    parcels.build(),
    queryBuilder.getMeta(),
  ]);

  return { data, meta };
};

const getTrackingInfo = async (trackingId: string) => {
  return await Parcel.findOne({ trackingId }).select(
    "trackingId currentStatus trackingEvents estimatedDeliveryDate deliveredAt"
  );
};

export const ParcelService = {
  createParcel,
  getParcelsForUser,
  getSingleParcel,
  cancelParcel,
  confirmDelivery,
  updateParcelStatus,
  getAllParcels,
  getTrackingInfo,
};
