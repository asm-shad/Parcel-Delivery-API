import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import httpStatus from "http-status-codes";
import { IsActive } from "../user/user.interface";
import { User } from "../user/user.model";
import { envVars } from "../../config/env";
import AppError from "../../errorHelpers/AppError";
import { verifyToken } from "../../utils/jwt";

export const checkAuth =
  (...authRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accessToken = req.headers.authorization;

      if (!accessToken) {
        throw new AppError(403, "No Token Recieved");
      }

      const verifiedToken = verifyToken(
        accessToken,
        envVars.JWT_ACCESS_SECRET
      ) as JwtPayload;
      // const verifiedToken = jwt.verify(accessToken, "secret");

      const isUserExist = await User.findOne({
        email: verifiedToken.email,
      });

      if (!isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, "User doesn't exist!");
      }

      if (
        isUserExist.isActive === IsActive.BLOCKED ||
        isUserExist.isActive === IsActive.INACTIVE
      ) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          `User is ${isUserExist.isActive}`
        );
      }

      if (isUserExist.isDeleted) {
        throw new AppError(httpStatus.BAD_REQUEST, "User is Deleted.");
      }

      if (!authRoles.includes(verifiedToken.role)) {
        throw new AppError(403, "You are not permitted to view this route!");
      }

      req.user = verifiedToken;
      // console.log(verifiedToken);

      next();
    } catch (err) {
      next(err);
    }
  };
