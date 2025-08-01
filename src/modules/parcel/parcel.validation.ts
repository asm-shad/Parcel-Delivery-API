import { z } from "zod";
import { ParcelStatus } from "./parcel.interface";

export const createParcelZodSchema = z.object({
  trackingId: z
    .string({ invalid_type_error: "Tracking ID must be string" })
    .min(3, { message: "Tracking ID must be at least 3 characters long." }),

  title: z
    .string({ invalid_type_error: "Title must be string" })
    .min(3, { message: "Title must be at least 3 characters long." }),

  description: z
    .string({ invalid_type_error: "Description must be string" })
    .max(500, { message: "Description cannot exceed 500 characters." }),

  images: z
    .array(z.string().url({ message: "Each image must be a valid URL." }))
    .optional(),

  type: z
    .string({ invalid_type_error: "Type must be string" })
    .min(2, { message: "Type must be at least 2 characters long." }),

  weightKg: z
    .number({ invalid_type_error: "Weight must be a number" })
    .positive({ message: "Weight must be a positive number." }),

  fee: z
    .number({ invalid_type_error: "Fee must be a number" })
    .nonnegative({ message: "Fee cannot be negative." }),

  sender: z.string({ invalid_type_error: "Sender ID must be string" }),

  receiver: z.string({ invalid_type_error: "Receiver ID must be string" }),

  senderAddress: z
    .string({ invalid_type_error: "Sender Address must be string" })
    .max(200, { message: "Sender Address cannot exceed 200 characters." }),

  receiverAddress: z
    .string({ invalid_type_error: "Receiver Address must be string" })
    .max(200, { message: "Receiver Address cannot exceed 200 characters." }),

  currentStatus: z
    .nativeEnum(ParcelStatus, { invalid_type_error: "Invalid parcel status" })
    .optional(),

  dispatchDate: z.coerce.date().optional(),
  estimatedDeliveryDate: z.coerce.date().optional(),
  deliveredAt: z.coerce.date().optional(),

  isBlocked: z.boolean().optional(),
  isCancelled: z.boolean().optional(),
  isDelivered: z.boolean().optional(),
});
