"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParcelService = void 0;
const QueryBuilder_1 = require("../../utils/QueryBuilder");
const parcel_interface_1 = require("./parcel.interface");
const parcel_model_1 = __importDefault(require("./parcel.model"));
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const mongoose_1 = require("mongoose");
const user_interface_1 = require("../user/user.interface");
const cloudinary_config_1 = require("../../config/cloudinary.config");
// Generate unique tracking ID
const generateTrackingId = () => {
    const now = new Date();
    const datePart = `${now.getFullYear()}${(now.getMonth() + 1)
        .toString()
        .padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}`;
    const randomPart = Math.floor(100000 + Math.random() * 900000);
    return `TRK-${datePart}-${randomPart}`;
};
const createParcel = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    payload.trackingId = generateTrackingId();
    payload.currentStatus = parcel_interface_1.ParcelStatus.Requested;
    // Create initial tracking event
    const initialEvent = {
        status: parcel_interface_1.ParcelStatus.Requested,
        timestamp: new Date(),
        location: payload.senderAddress,
        updatedBy: payload.sender,
        note: "Parcel created",
    };
    payload.trackingEvents = [initialEvent];
    return yield parcel_model_1.default.create(payload);
});
const getUserParcels = (userId_1, role_1, ...args_1) => __awaiter(void 0, [userId_1, role_1, ...args_1], void 0, function* (userId, role, query = {}) {
    let baseFilter = {
        currentStatus: { $nin: ["Cancelled"] }, // Exclude these statuses
    };
    if (role === user_interface_1.UserRole.SENDER) {
        baseFilter.sender = userId;
    }
    else if (role === user_interface_1.UserRole.RECEIVER) {
        baseFilter.receiver = userId;
    }
    const queryBuilder = new QueryBuilder_1.QueryBuilder(parcel_model_1.default.find(baseFilter), query);
    return yield queryBuilder.filter().sort().paginate().build();
});
const getSingleParcel = (parcelId, userId, role) => __awaiter(void 0, void 0, void 0, function* () {
    const parcel = yield parcel_model_1.default.findById(parcelId);
    if (!parcel) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Parcel not found");
    }
    // Authorization check
    if (role !== user_interface_1.UserRole.ADMIN &&
        role !== user_interface_1.UserRole.SUPER_ADMIN &&
        parcel.sender.toString() !== userId &&
        parcel.receiver.toString() !== userId) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Not authorized to view this parcel");
    }
    return parcel;
});
const updateParcel = (parcelId, userId, updateData) => __awaiter(void 0, void 0, void 0, function* () {
    const parcel = yield parcel_model_1.default.findById(parcelId);
    if (!parcel) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Parcel not found");
    }
    // Authorization check - only sender can update
    if (parcel.sender.toString() !== userId) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Not authorized to update this parcel");
    }
    // Status validation - only allow updates for Requested status
    if (parcel.currentStatus !== parcel_interface_1.ParcelStatus.Requested) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Can only update parcels with Requested status");
    }
    // --- Handle Images ---
    let updatedImages = parcel.images || [];
    // Append new images if provided
    if (updateData.images && updateData.images.length > 0) {
        updatedImages = [...updatedImages, ...updateData.images];
    }
    // Handle deletions
    if (updateData.deleteImages && updateData.deleteImages.length > 0) {
        updatedImages = updatedImages.filter((url) => { var _a; return !((_a = updateData.deleteImages) === null || _a === void 0 ? void 0 : _a.includes(url)); });
    }
    // Build final update payload (exclude deleteImages)
    const { deleteImages } = updateData, restUpdateData = __rest(updateData, ["deleteImages"]);
    restUpdateData.images = updatedImages;
    // Update DB
    const updatedParcel = yield parcel_model_1.default.findByIdAndUpdate(parcelId, restUpdateData, {
        new: true,
        runValidators: true,
    });
    if (!updatedParcel) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Parcel not found after update");
    }
    // --- Delete removed images from Cloudinary ---
    if (deleteImages && deleteImages.length > 0) {
        yield Promise.all(deleteImages.map((url) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                yield (0, cloudinary_config_1.deleteImageFromCLoudinary)(url);
            }
            catch (err) {
                console.error("Failed to delete from Cloudinary:", url, err);
            }
        })));
    }
    return updatedParcel;
});
const cancelParcel = (parcelId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const parcel = yield parcel_model_1.default.findById(parcelId);
    if (!parcel) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Parcel not found");
    }
    // Authorization and status check
    if (parcel.sender.toString() !== userId) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Not authorized to cancel this parcel");
    }
    if (parcel.currentStatus !== parcel_interface_1.ParcelStatus.Requested) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Cannot cancel parcel after approval");
    }
    // Create cancellation event
    const cancelEvent = {
        status: parcel_interface_1.ParcelStatus.Cancelled,
        timestamp: new Date(),
        location: parcel.senderAddress,
        updatedBy: new mongoose_1.Types.ObjectId(userId),
        note: "Parcel cancelled by sender",
    };
    parcel.trackingEvents.push(cancelEvent);
    parcel.currentStatus = parcel_interface_1.ParcelStatus.Cancelled;
    parcel.isCancelled = true;
    return yield parcel.save();
});
const confirmDelivery = (parcelId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const parcel = yield parcel_model_1.default.findById(parcelId);
    if (!parcel) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Parcel not found");
    }
    // Authorization check
    if (parcel.receiver.toString() !== userId) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Not authorized to confirm delivery");
    }
    // Status validation
    if (parcel.currentStatus !== parcel_interface_1.ParcelStatus.InTransit) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Parcel must be in transit before delivery confirmation");
    }
    // Create delivery event
    const deliveryEvent = {
        status: parcel_interface_1.ParcelStatus.Delivered,
        timestamp: new Date(),
        location: parcel.receiverAddress,
        updatedBy: new mongoose_1.Types.ObjectId(userId),
        note: "Parcel delivered",
    };
    parcel.trackingEvents.push(deliveryEvent);
    parcel.currentStatus = parcel_interface_1.ParcelStatus.Delivered;
    parcel.isDelivered = true;
    parcel.deliveredAt = new Date();
    return yield parcel.save();
});
const updateParcelStatus = (parcelId, status, adminId, location, note) => __awaiter(void 0, void 0, void 0, function* () {
    const parcel = yield parcel_model_1.default.findById(parcelId);
    if (!parcel) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Parcel not found");
    }
    // Status transition validation
    const validTransitions = {
        [parcel_interface_1.ParcelStatus.Requested]: [parcel_interface_1.ParcelStatus.Approved, parcel_interface_1.ParcelStatus.Cancelled],
        [parcel_interface_1.ParcelStatus.Approved]: [parcel_interface_1.ParcelStatus.Dispatched, parcel_interface_1.ParcelStatus.Blocked],
        [parcel_interface_1.ParcelStatus.Dispatched]: [parcel_interface_1.ParcelStatus.InTransit, parcel_interface_1.ParcelStatus.Blocked],
        [parcel_interface_1.ParcelStatus.InTransit]: [parcel_interface_1.ParcelStatus.Delivered, parcel_interface_1.ParcelStatus.Blocked],
        [parcel_interface_1.ParcelStatus.Delivered]: [],
        [parcel_interface_1.ParcelStatus.Cancelled]: [],
        [parcel_interface_1.ParcelStatus.Blocked]: [parcel_interface_1.ParcelStatus.Approved],
    };
    if (!validTransitions[parcel.currentStatus].includes(status)) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, `Invalid status transition from ${parcel.currentStatus} to ${status}`);
    }
    // Create status update event
    const statusEvent = {
        status,
        timestamp: new Date(),
        location,
        updatedBy: new mongoose_1.Types.ObjectId(adminId),
        note: note || `Status updated to ${status}`,
    };
    parcel.trackingEvents.push(statusEvent);
    parcel.currentStatus = status;
    // Update flags based on status
    if (status === parcel_interface_1.ParcelStatus.Blocked) {
        parcel.isBlocked = true;
    }
    else if (status === parcel_interface_1.ParcelStatus.Approved && parcel.isBlocked) {
        parcel.isBlocked = false;
    }
    return yield parcel.save();
});
const getAllParcels = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const queryBuilder = new QueryBuilder_1.QueryBuilder(parcel_model_1.default.find(), query);
    const parcels = yield queryBuilder
        .search(["trackingId", "title", "senderAddress", "receiverAddress"])
        .filter()
        .sort()
        .fields()
        .paginate();
    const [data, meta] = yield Promise.all([
        parcels.build(),
        queryBuilder.getMeta(),
    ]);
    return { data, meta };
});
const getTrackingInfo = (trackingId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield parcel_model_1.default.findOne({ trackingId }).select("trackingId currentStatus trackingEvents estimatedDeliveryDate deliveredAt");
});
exports.ParcelService = {
    createParcel,
    getUserParcels,
    getSingleParcel,
    updateParcel,
    cancelParcel,
    confirmDelivery,
    updateParcelStatus,
    getAllParcels,
    getTrackingInfo,
};
