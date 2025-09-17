import { Types } from "mongoose";

export enum ParcelStatus {
  Requested = "Requested",
  Approved = "Approved",
  Dispatched = "Dispatched",
  InTransit = "In Transit",
  Delivered = "Delivered",
  Cancelled = "Cancelled",
  Blocked = "Blocked",
}

export interface ITrackingEvent {
  status: ParcelStatus;
  timestamp: Date;
  location: string;
  updatedBy: Types.ObjectId;
  note?: string;
}

export interface IParcel {
  _id?: Types.ObjectId;
  trackingId: string;
  title: string;
  description: string;
  images?: string[];
  type: string;
  weightKg: number;
  fee: number;

  sender: Types.ObjectId;
  receiver: Types.ObjectId;

  senderAddress: string;
  receiverAddress: string;

  currentStatus: ParcelStatus;
  trackingEvents: ITrackingEvent[];

  dispatchDate?: Date;
  estimatedDeliveryDate?: Date;
  deliveredAt?: Date;

  isBlocked?: boolean;
  isCancelled?: boolean;
  isDelivered?: boolean;

  createdAt?: Date;
  updatedAt?: Date;
  deleteImages?: string[];
}
