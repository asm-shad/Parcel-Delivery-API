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
exports.StatsService = void 0;
const user_model_1 = require("../user/user.model");
const parcel_model_1 = __importDefault(require("../parcel/parcel.model"));
const user_interface_1 = require("../user/user.interface");
const now = new Date();
const sevenDaysAgo = new Date(now).setDate(now.getDate() - 7);
const thirtyDaysAgo = new Date(now).setDate(now.getDate() - 30);
const getUserStats = () => __awaiter(void 0, void 0, void 0, function* () {
    const totalUsersPromise = user_model_1.User.countDocuments({ isDeleted: false });
    const totalActiveUsersPromise = user_model_1.User.countDocuments({
        isActive: user_interface_1.IsActive.ACTIVE,
        isDeleted: false,
    });
    const totalInActiveUsersPromise = user_model_1.User.countDocuments({
        isActive: user_interface_1.IsActive.INACTIVE,
        isDeleted: false,
    });
    const totalBlockedUsersPromise = user_model_1.User.countDocuments({
        isActive: user_interface_1.IsActive.BLOCKED,
        isDeleted: false,
    });
    const newUsersInLast7DaysPromise = user_model_1.User.countDocuments({
        createdAt: { $gte: sevenDaysAgo },
        isDeleted: false,
    });
    const newUsersInLast30DaysPromise = user_model_1.User.countDocuments({
        createdAt: { $gte: thirtyDaysAgo },
        isDeleted: false,
    });
    const usersByRolePromise = user_model_1.User.aggregate([
        {
            $match: { isDeleted: false },
        },
        {
            $group: {
                _id: "$role",
                count: { $sum: 1 },
            },
        },
    ]);
    const [totalUsers, totalActiveUsers, totalInActiveUsers, totalBlockedUsers, newUsersInLast7Days, newUsersInLast30Days, usersByRole,] = yield Promise.all([
        totalUsersPromise,
        totalActiveUsersPromise,
        totalInActiveUsersPromise,
        totalBlockedUsersPromise,
        newUsersInLast7DaysPromise,
        newUsersInLast30DaysPromise,
        usersByRolePromise,
    ]);
    return {
        totalUsers,
        totalActiveUsers,
        totalInActiveUsers,
        totalBlockedUsers,
        newUsersInLast7Days,
        newUsersInLast30Days,
        usersByRole,
    };
});
const getParcelStats = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    // Basic counts
    const totalParcelsPromise = parcel_model_1.default.countDocuments();
    const totalDeliveredParcelsPromise = parcel_model_1.default.countDocuments({
        isDelivered: true,
    });
    const totalCancelledParcelsPromise = parcel_model_1.default.countDocuments({
        isCancelled: true,
    });
    const totalBlockedParcelsPromise = parcel_model_1.default.countDocuments({ isBlocked: true });
    // Parcels by status
    const parcelsByStatusPromise = parcel_model_1.default.aggregate([
        {
            $group: {
                _id: "$currentStatus",
                count: { $sum: 1 },
            },
        },
    ]);
    // Parcels created in time periods
    const parcelsLast7DaysPromise = parcel_model_1.default.countDocuments({
        createdAt: { $gte: sevenDaysAgo },
    });
    const parcelsLast30DaysPromise = parcel_model_1.default.countDocuments({
        createdAt: { $gte: thirtyDaysAgo },
    });
    // Revenue stats (only delivered parcels)
    const revenueStatsPromise = parcel_model_1.default.aggregate([
        {
            $match: { isDelivered: true },
        },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: "$fee" },
                avgParcelValue: { $avg: "$fee" },
            },
        },
    ]);
    // Parcels by type
    const parcelsByTypePromise = parcel_model_1.default.aggregate([
        {
            $group: {
                _id: "$type",
                count: { $sum: 1 },
            },
        },
    ]);
    // Delivery timeline stats
    const deliveryTimelinePromise = parcel_model_1.default.aggregate([
        {
            $match: {
                isDelivered: true,
                dispatchDate: { $exists: true },
                deliveredAt: { $exists: true },
            },
        },
        {
            $addFields: {
                deliveryDays: {
                    $divide: [
                        { $subtract: ["$deliveredAt", "$dispatchDate"] },
                        1000 * 60 * 60 * 24, // Convert milliseconds to days
                    ],
                },
            },
        },
        {
            $group: {
                _id: null,
                avgDeliveryDays: { $avg: "$deliveryDays" },
                minDeliveryDays: { $min: "$deliveryDays" },
                maxDeliveryDays: { $max: "$deliveryDays" },
            },
        },
    ]);
    // Top senders
    const topSendersPromise = parcel_model_1.default.aggregate([
        {
            $group: {
                _id: "$sender",
                parcelCount: { $sum: 1 },
            },
        },
        {
            $sort: { parcelCount: -1 },
        },
        {
            $limit: 5,
        },
        {
            $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "senderInfo",
            },
        },
        {
            $unwind: "$senderInfo",
        },
        {
            $project: {
                parcelCount: 1,
                "senderInfo.name": 1,
                "senderInfo.email": 1,
            },
        },
    ]);
    // Top receivers
    const topReceiversPromise = parcel_model_1.default.aggregate([
        {
            $group: {
                _id: "$receiver",
                parcelCount: { $sum: 1 },
            },
        },
        {
            $sort: { parcelCount: -1 },
        },
        {
            $limit: 5,
        },
        {
            $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "receiverInfo",
            },
        },
        {
            $unwind: "$receiverInfo",
        },
        {
            $project: {
                parcelCount: 1,
                "receiverInfo.name": 1,
                "receiverInfo.email": 1,
            },
        },
    ]);
    const [totalParcels, totalDeliveredParcels, totalCancelledParcels, totalBlockedParcels, parcelsByStatus, parcelsLast7Days, parcelsLast30Days, revenueStats, parcelsByType, deliveryTimeline, topSenders, topReceivers,] = yield Promise.all([
        totalParcelsPromise,
        totalDeliveredParcelsPromise,
        totalCancelledParcelsPromise,
        totalBlockedParcelsPromise,
        parcelsByStatusPromise,
        parcelsLast7DaysPromise,
        parcelsLast30DaysPromise,
        revenueStatsPromise,
        parcelsByTypePromise,
        deliveryTimelinePromise,
        topSendersPromise,
        topReceiversPromise,
    ]);
    return {
        totalParcels,
        totalDeliveredParcels,
        totalCancelledParcels,
        totalBlockedParcels,
        parcelsByStatus,
        parcelsLast7Days,
        parcelsLast30Days,
        totalRevenue: ((_a = revenueStats[0]) === null || _a === void 0 ? void 0 : _a.totalRevenue) || 0,
        avgParcelValue: ((_b = revenueStats[0]) === null || _b === void 0 ? void 0 : _b.avgParcelValue) || 0,
        parcelsByType,
        avgDeliveryDays: ((_c = deliveryTimeline[0]) === null || _c === void 0 ? void 0 : _c.avgDeliveryDays) || 0,
        minDeliveryDays: ((_d = deliveryTimeline[0]) === null || _d === void 0 ? void 0 : _d.minDeliveryDays) || 0,
        maxDeliveryDays: ((_e = deliveryTimeline[0]) === null || _e === void 0 ? void 0 : _e.maxDeliveryDays) || 0,
        topSenders,
        topReceivers,
    };
});
exports.StatsService = {
    getUserStats,
    getParcelStats,
};
