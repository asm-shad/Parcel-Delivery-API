import { Router } from "express";
import { ParcelController } from "./parcel.controller";
import { UserRole } from "../user/user.interface";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import {
  createParcelZodSchema,
  senderUpdateParcelZodSchema,
} from "./parcel.validation";
import { multerUpload } from "../../config/multer.config";

const router = Router();

// Sender routes
router.post(
  "/create",
  checkAuth(UserRole.SENDER),
  multerUpload.array("files"),
  validateRequest(createParcelZodSchema),
  ParcelController.createParcel
);

router.get(
  "/my-parcels",
  checkAuth(UserRole.SENDER),
  ParcelController.getUserParcels
);

router.patch(
  "/update/:id",
  checkAuth(UserRole.SENDER),
  multerUpload.array("files"), // Optional: if you want to allow image updates
  validateRequest(senderUpdateParcelZodSchema), // Use your existing update schema
  ParcelController.updateParcel
);

router.patch(
  "/cancel/:id",
  checkAuth(UserRole.SENDER),
  ParcelController.cancelParcel
);

// Receiver routes
router.get(
  "/incoming-parcels",
  checkAuth(UserRole.RECEIVER),
  ParcelController.getUserParcels
);

router.patch(
  "/deliver/:id",
  checkAuth(UserRole.RECEIVER),
  ParcelController.confirmDelivery
);

// Admin routes
router.get(
  "/",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  ParcelController.getAllParcels
);

router.get(
  "/:id",
  checkAuth(...Object.values(UserRole)),
  ParcelController.getParcelDetails
);

router.patch(
  "/status/:id",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  ParcelController.updateStatus
);

// Public route
router.get("/track/:trackingId", ParcelController.trackParcel);

export const ParcelRoutes = router;
