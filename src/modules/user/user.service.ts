import AppError from "../../errorHelpers/AppError";
import { IAuthProvider, IsActive, IUser, UserRole } from "./user.interface";
import { User } from "./user.model";
import httpStatus from "http-status-codes";
import bcryptjs from "bcryptjs";
import { envVars } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";

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

  if (payload.role) {
    if (
      decodedToken.role === UserRole.SENDER ||
      decodedToken.role === UserRole.RECIEVER
    ) {
      throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
    }

    if (
      payload.role === UserRole.SUPER_ADMIN &&
      decodedToken.role === UserRole.ADMIN
    ) {
      throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
    }
  }
  if (payload.isActive || payload.isDeleted || payload.isVerified) {
    if (
      decodedToken.role === UserRole.SENDER ||
      decodedToken.role === UserRole.RECIEVER
    ) {
      throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
    }
  }

  if (payload.password) {
    if (payload.password) {
      payload.password = await bcryptjs.hash(
        payload.password,
        envVars.BCRYPT_SALT_ROUND
      );
    }
  }

  const newUpdatedUser = await User.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true,
  });

  return newUpdatedUser;
};

const getAllUsers = async () => {
  const users = await User.find({});
  const totalUsers = await User.countDocuments();

  return {
    data: users,
    meta: {
      total: totalUsers,
    },
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

  if (
    (user.isActive === IsActive.INACTIVE ||
      user.isActive === IsActive.BLOCKED) &&
    status !== IsActive.ACTIVE
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Inactive/Blocked user can only be activated"
    );
  }

  user.isActive = status;
  await user.save();

  return user;
};

const getSingleUser = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
  }
  return user;
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
};
