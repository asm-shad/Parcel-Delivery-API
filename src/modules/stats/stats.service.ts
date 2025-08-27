import { ParcelStatus } from "../parcel/parcel.interface";
import { User } from "../user/user.model";
import Parcel from "../parcel/parcel.model";
import { IsActive, UserRole } from "../user/user.interface";

const now = new Date();
const sevenDaysAgo = new Date(now).setDate(now.getDate() - 7);
const thirtyDaysAgo = new Date(now).setDate(now.getDate() - 30);

const getUserStats = async () => {
  const totalUsersPromise = User.countDocuments({ isDeleted: false });

  const totalActiveUsersPromise = User.countDocuments({
    isActive: IsActive.ACTIVE,
    isDeleted: false,
  });

  const totalInActiveUsersPromise = User.countDocuments({
    isActive: IsActive.INACTIVE,
    isDeleted: false,
  });

  const totalBlockedUsersPromise = User.countDocuments({
    isActive: IsActive.BLOCKED,
    isDeleted: false,
  });

  const newUsersInLast7DaysPromise = User.countDocuments({
    createdAt: { $gte: sevenDaysAgo },
    isDeleted: false,
  });

  const newUsersInLast30DaysPromise = User.countDocuments({
    createdAt: { $gte: thirtyDaysAgo },
    isDeleted: false,
  });

  const usersByRolePromise = User.aggregate([
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

  const [
    totalUsers,
    totalActiveUsers,
    totalInActiveUsers,
    totalBlockedUsers,
    newUsersInLast7Days,
    newUsersInLast30Days,
    usersByRole,
  ] = await Promise.all([
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
};

const getParcelStats = async () => {
  // Basic counts
  const totalParcelsPromise = Parcel.countDocuments();
  const totalDeliveredParcelsPromise = Parcel.countDocuments({
    isDelivered: true,
  });
  const totalCancelledParcelsPromise = Parcel.countDocuments({
    isCancelled: true,
  });
  const totalBlockedParcelsPromise = Parcel.countDocuments({ isBlocked: true });

  // Parcels by status
  const parcelsByStatusPromise = Parcel.aggregate([
    {
      $group: {
        _id: "$currentStatus",
        count: { $sum: 1 },
      },
    },
  ]);

  // Parcels created in time periods
  const parcelsLast7DaysPromise = Parcel.countDocuments({
    createdAt: { $gte: sevenDaysAgo },
  });

  const parcelsLast30DaysPromise = Parcel.countDocuments({
    createdAt: { $gte: thirtyDaysAgo },
  });

  // Revenue stats (only delivered parcels)
  const revenueStatsPromise = Parcel.aggregate([
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
  const parcelsByTypePromise = Parcel.aggregate([
    {
      $group: {
        _id: "$type",
        count: { $sum: 1 },
      },
    },
  ]);

  // Delivery timeline stats
  const deliveryTimelinePromise = Parcel.aggregate([
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
  const topSendersPromise = Parcel.aggregate([
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
  const topReceiversPromise = Parcel.aggregate([
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

  const [
    totalParcels,
    totalDeliveredParcels,
    totalCancelledParcels,
    totalBlockedParcels,
    parcelsByStatus,
    parcelsLast7Days,
    parcelsLast30Days,
    revenueStats,
    parcelsByType,
    deliveryTimeline,
    topSenders,
    topReceivers,
  ] = await Promise.all([
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
    totalRevenue: revenueStats[0]?.totalRevenue || 0,
    avgParcelValue: revenueStats[0]?.avgParcelValue || 0,
    parcelsByType,
    avgDeliveryDays: deliveryTimeline[0]?.avgDeliveryDays || 0,
    minDeliveryDays: deliveryTimeline[0]?.minDeliveryDays || 0,
    maxDeliveryDays: deliveryTimeline[0]?.maxDeliveryDays || 0,
    topSenders,
    topReceivers,
  };
};

export const StatsService = {
  getUserStats,
  getParcelStats,
};
