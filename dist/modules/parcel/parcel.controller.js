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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParcelController = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const parcel_service_1 = require("./parcel.service");
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const createParcel = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const user = req.user;
    const payload = Object.assign(Object.assign({}, req.body), { sender: user.userId, images: (_a = req.files) === null || _a === void 0 ? void 0 : _a.map((file) => file.path) }); // Use user.userId
    const parcel = yield parcel_service_1.ParcelService.createParcel(payload);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        message: "Parcel created successfully",
        data: parcel,
    });
}));
const getUserParcels = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const convertedQuery = {};
    for (const [key, value] of Object.entries(req.query)) {
        if (typeof value === "string") {
            convertedQuery[key] = value;
        }
        else if (Array.isArray(value)) {
            convertedQuery[key] = value.join(",");
        }
    }
    const parcels = yield parcel_service_1.ParcelService.getUserParcels(user.userId, user.role, convertedQuery);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Parcels retrieved successfully",
        data: parcels,
    });
}));
const getParcelDetails = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const parcel = yield parcel_service_1.ParcelService.getSingleParcel(req.params.id, user.userId, user.role);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Parcel details retrieved",
        data: parcel,
    });
}));
const updateParcel = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    // Copy body into updateData
    const updateData = Object.assign({}, req.body);
    // Convert deleteImages to an array (handle string or JSON)
    if (req.body.deleteImages) {
        try {
            // Support both array and stringified JSON
            updateData.deleteImages = Array.isArray(req.body.deleteImages)
                ? req.body.deleteImages
                : JSON.parse(req.body.deleteImages);
        }
        catch (_a) {
            updateData.deleteImages = [req.body.deleteImages];
        }
    }
    // Handle new uploaded files (Cloudinary URLs)
    if (req.files && Array.isArray(req.files)) {
        const uploadedImages = req.files.map((file) => file.path // CloudinaryStorage sets .path to URL
        );
        // Merge with body.images if provided
        updateData.images = [...(updateData.images || []), ...uploadedImages];
    }
    const updatedParcel = yield parcel_service_1.ParcelService.updateParcel(req.params.id, user.userId, updateData);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Parcel updated successfully",
        data: updatedParcel,
    });
}));
const cancelParcel = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const parcel = yield parcel_service_1.ParcelService.cancelParcel(req.params.id, user.userId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Parcel cancelled successfully",
        data: parcel,
    });
}));
const confirmDelivery = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const parcel = yield parcel_service_1.ParcelService.confirmDelivery(req.params.id, user.userId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Delivery confirmed successfully",
        data: parcel,
    });
}));
const updateStatus = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const { status, location, note } = req.body;
    const parcel = yield parcel_service_1.ParcelService.updateParcelStatus(req.params.id, status, user.userId, location, note);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Parcel status updated",
        data: parcel,
    });
}));
const getAllParcels = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const convertedQuery = {};
    for (const [key, value] of Object.entries(req.query)) {
        if (typeof value === "string") {
            convertedQuery[key] = value;
        }
        else if (Array.isArray(value)) {
            convertedQuery[key] = value.join(",");
        }
    }
    const { data, meta } = yield parcel_service_1.ParcelService.getAllParcels(convertedQuery);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "All parcels retrieved",
        data,
        meta,
    });
}));
const trackParcel = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const trackingInfo = yield parcel_service_1.ParcelService.getTrackingInfo(req.params.trackingId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Tracking information retrieved",
        data: trackingInfo,
    });
}));
exports.ParcelController = {
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
