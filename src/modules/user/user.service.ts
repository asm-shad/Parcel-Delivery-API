import AppError from "../../errorHelpers/AppError";
import { IAuthProvider, IsActive, IUser, UserRole } from "./user.interface";
import { User } from "./user.model";
import httpStatus from "http-status-codes";
import bcryptjs from "bcryptjs";
import { envVars } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";
import { deleteImageFromCLoudinary } from "../../config/cloudinary.config";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { userSearchableFields } from "./user.constant";

const createUser = async (payload: Partial<IUser>) => {
  const { email, password, ...rest } = payload;

  const isUserExist = await User.findOne({ email });
  if (isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "User Already Exist");
  }

  const hashedPassword = await bcryptjs.hash(
    password as string,
    Number(envVars.BCRYPT_SALT_ROUND)
  );

  const authProvider: IAuthProvider = {
    provider: "credentials",
    providerId: email as string,
  };

  const user = await User.create({
    email,
    password: hashedPassword,
    auths: [authProvider],
    ...rest,
  });

  return user;
};

const updateUser = async (
  userId: string,
  payload: Partial<IUser>,
  decodedToken: JwtPayload
) => {
  const isUserExist = await User.findById(userId);

  if (!isUserExist) {
    throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
  }

  if (payload.role !== undefined) {
    if (
      decodedToken.role === UserRole.SENDER ||
      decodedToken.role === UserRole.RECEIVER
    ) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You are not authorized to update role"
      );
    }

    if (
      payload.role === UserRole.SUPER_ADMIN &&
      decodedToken.role === UserRole.ADMIN
    ) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "Admins cannot promote to Super Admin"
      );
    }
  }

  // 🔒 Restricted flags (only admins/superadmins can change)
  const restrictedFields: (keyof IUser)[] = [
    "isActive",
    "isDeleted",
    "isVerified",
  ];
  for (const field of restrictedFields) {
    if (payload[field] !== undefined) {
      if (
        decodedToken.role === UserRole.SENDER ||
        decodedToken.role === UserRole.RECEIVER
      ) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          `You are not authorized to update ${field}`
        );
      }
    }
  }

  const updatedUser = await User.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true,
  });

  if (payload.picture && isUserExist.picture) {
    await deleteImageFromCLoudinary(isUserExist.picture);
  }

  return updatedUser;
};

const getAllUsers = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(User.find(), query);
  const usersData = queryBuilder
    .filter()
    .search(userSearchableFields)
    .sort()
    .fields()
    .paginate();

  const [data, meta] = await Promise.all([
    usersData.build(),
    queryBuilder.getMeta(),
  ]);

  return {
    data,
    meta,
  };
};

const updateUserStatus = async (userId: string, status: IsActive) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
  }

  // Status transition validation
  if (user.isActive === IsActive.ACTIVE && status !== IsActive.BLOCKED) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Active user can only be blocked"
    );
  }

  user.isActive = status;
  await user.save();

  return user;
};

const getSingleUser = async (userId: string) => {
  const user = await User.findOne({
    _id: userId,
    isDeleted: { $ne: true },
  }).select("-password");
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User Not Found or Deleted");
  }
  return user;
};

const getMe = async (userId: string) => {
  const user = await User.findById(userId).select("-password");
  return {
    data: user,
  };
};

const deleteUser = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { isDeleted: true },
    { new: true, runValidators: true }
  );

  return updatedUser;
};

export const UserServices = {
  createUser,
  getAllUsers,
  updateUser,
  updateUserStatus,
  getSingleUser,
  deleteUser,
  getMe,
};
