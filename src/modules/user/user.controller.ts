import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { UserServices } from "./user.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { JwtPayload } from "jsonwebtoken";

const createUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await UserServices.createUser(req.body);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "User Created Successfully",
      data: user,
    });
  }
);

const updateUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;

    const verifiedToken = req.user;

    const payload = {
      ...req.body,
      picture: req.file?.path,
    };
    const user = await UserServices.updateUser(
      userId,
      payload,
      verifiedToken as JwtPayload
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "User Updated Successfully",
      data: user,
    });
  }
);

const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const result = await UserServices.getAllUsers(
      query as Record<string, string>
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "All Users fetched Successfully",
      data: result.data,
      meta: result.meta,
    });
  }
);

const updateUserStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;
    const { status } = req.body;
    const user = await UserServices.updateUserStatus(userId, status);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User status updated successfully",
      data: user,
    });
  }
);

const getMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload;
    const result = await UserServices.getMe(decodedToken.userId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Your profile Retrieved Successfully",
      data: result.data,
    });
  }
);

const getSingleUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;
    const user = await UserServices.getSingleUser(userId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User retrieved successfully",
      data: user,
    });
  }
);

const deleteUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;
    const user = await UserServices.deleteUser(userId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User deleted successfully",
      data: user,
    });
  }
);

export const UserControllers = {
  createUser,
  updateUser,
  getAllUsers,
  updateUserStatus,
  getMe,
  getSingleUser,
  deleteUser,
};
