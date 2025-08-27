"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParcelRoutes = void 0;
const express_1 = require("express");
const parcel_controller_1 = require("./parcel.controller");
const user_interface_1 = require("../user/user.interface");
const checkAuth_1 = require("../../middlewares/checkAuth");
const validateRequest_1 = require("../../middlewares/validateRequest");
const parcel_validation_1 = require("./parcel.validation");
const multer_config_1 = require("../../config/multer.config");
const router = (0, express_1.Router)();
// Sender routes
router.post("/create", (0, checkAuth_1.checkAuth)(user_interface_1.UserRole.SENDER), multer_config_1.multerUpload.array("files"), (0, validateRequest_1.validateRequest)(parcel_validation_1.createParcelZodSchema), parcel_controller_1.ParcelController.createParcel);
router.get("/my-parcels", (0, checkAuth_1.checkAuth)(user_interface_1.UserRole.SENDER), parcel_controller_1.ParcelController.getUserParcels);
router.patch("/update/:id", (0, checkAuth_1.checkAuth)(user_interface_1.UserRole.SENDER), multer_config_1.multerUpload.array("files"), // Optional: if you want to allow image updates
(0, validateRequest_1.validateRequest)(parcel_validation_1.senderUpdateParcelZodSchema), // Use your existing update schema
parcel_controller_1.ParcelController.updateParcel);
router.patch("/cancel/:id", (0, checkAuth_1.checkAuth)(user_interface_1.UserRole.SENDER), parcel_controller_1.ParcelController.cancelParcel);
// Receiver routes
router.get("/incoming-parcels", (0, checkAuth_1.checkAuth)(user_interface_1.UserRole.RECEIVER), parcel_controller_1.ParcelController.getUserParcels);
router.patch("/deliver/:id", (0, checkAuth_1.checkAuth)(user_interface_1.UserRole.RECEIVER), parcel_controller_1.ParcelController.confirmDelivery);
// Admin routes
router.get("/", (0, checkAuth_1.checkAuth)(user_interface_1.UserRole.ADMIN, user_interface_1.UserRole.SUPER_ADMIN), parcel_controller_1.ParcelController.getAllParcels);
router.get("/:id", (0, checkAuth_1.checkAuth)(...Object.values(user_interface_1.UserRole)), parcel_controller_1.ParcelController.getParcelDetails);
router.patch("/status/:id", (0, checkAuth_1.checkAuth)(user_interface_1.UserRole.ADMIN, user_interface_1.UserRole.SUPER_ADMIN), parcel_controller_1.ParcelController.updateStatus);
// Public route
router.get("/track/:trackingId", parcel_controller_1.ParcelController.trackParcel);
exports.ParcelRoutes = router;
