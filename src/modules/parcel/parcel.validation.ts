import z from "zod";

export const createParcelZodSchema = z.object({
  title: z
    .string({ invalid_type_error: "Title must be a string" })
    .min(3, { message: "Title must be at least 3 characters long." })
    .max(100, { message: "Title cannot exceed 100 characters." }),

  description: z
    .string({ invalid_type_error: "Description must be a string" })
    .min(10, { message: "Description must be at least 10 characters long." })
    .max(500, { message: "Description cannot exceed 500 characters." }),

  images: z
    .array(z.string().url({ message: "Each image must be a valid URL." }))
    .optional(),

  type: z
    .string({ invalid_type_error: "Parcel type must be a string" })
    .min(2, { message: "Type must be at least 2 characters long." })
    .max(50, { message: "Type cannot exceed 50 characters." }),

  weightKg: z
    .number({ invalid_type_error: "Weight must be a number" })
    .positive({ message: "Weight must be a positive number." })
    .max(100, { message: "Weight cannot exceed 100kg." }),

  fee: z
    .number({ invalid_type_error: "Fee must be a number" })
    .positive({ message: "Fee must be a positive number." }),

  receiver: z.string({ invalid_type_error: "Receiver ID must be a string" }),

  senderAddress: z
    .string({ invalid_type_error: "Sender address must be a string" })
    .min(5, { message: "Sender address must be at least 5 characters long." })
    .max(200, { message: "Sender address cannot exceed 200 characters." }),

  receiverAddress: z
    .string({ invalid_type_error: "Receiver address must be a string" })
    .min(5, { message: "Receiver address must be at least 5 characters long." })
    .max(200, { message: "Receiver address cannot exceed 200 characters." }),
});

export const senderUpdateParcelZodSchema = z.object({
  title: z
    .string({ invalid_type_error: "Title must be a string" })
    .min(3, { message: "Title must be at least 3 characters long." })
    .max(100, { message: "Title cannot exceed 100 characters." })
    .optional(),

  description: z
    .string({ invalid_type_error: "Description must be a string" })
    .min(10, { message: "Description must be at least 10 characters long." })
    .max(500, { message: "Description cannot exceed 500 characters." })
    .optional(),

  images: z
    .array(z.string().url({ message: "Each image must be a valid URL." }))
    .optional(),

  type: z
    .string({ invalid_type_error: "Type must be a string" })
    .min(2, { message: "Type must be at least 2 characters long." })
    .max(50, { message: "Type cannot exceed 50 characters." })
    .optional(),

  weightKg: z
    .number({ invalid_type_error: "Weight must be a number" })
    .positive({ message: "Weight must be a positive number." })
    .max(100, { message: "Weight cannot exceed 100kg." })
    .optional(),

  receiverAddress: z
    .string({ invalid_type_error: "Receiver address must be a string" })
    .min(5, {
      message: "Receiver address must be at least 5 characters long.",
    })
    .max(200, { message: "Receiver address cannot exceed 200 characters." })
    .optional(),

  deleteImages: z
    .array(
      z.string({
        invalid_type_error: "Delete images must be an array of strings",
      })
    )
    .optional(),
});

// Create a refined version for runtime validation
export const senderUpdateParcelZodSchemaRefined =
  senderUpdateParcelZodSchema.refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

// Create a version without refinement for middleware (ZodObject)
export const senderUpdateParcelZodSchemaForMiddleware =
  senderUpdateParcelZodSchema;
