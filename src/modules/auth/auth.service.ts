import AppError from "../../errorHelpers/AppError";
import { IUser } from "../user/user.interface";
import httpStatus from "http-status-codes";
import { User } from "../user/user.model";
import bcryptjs from "bcryptjs";
import { generateToken } from "../../utils/jwt";
import { envVars } from "../../config/env";

const credentialsLogin = async (payload: Partial<IUser>) => {
  const { email, password } = payload;

  const isUserExist = await User.findOne({ email });

  if (!isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "User doesn't exist!");
  }

  const isPasswordMatched = await bcryptjs.compare(
    password as string,
    isUserExist.password as string
  );

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.BAD_REQUEST, "Incorrect Password");
  }

  const jwtPayload = {
    email: isUserExist.email,
    role: isUserExist.role,
    userId: isUserExist._id,
  };

  const accessToken = generateToken(
    jwtPayload,
    envVars.JWT_ACCESS_SECRET,
    envVars.JWT_ACCESS_EXPIRES
  );

  // const refreshToken = generateToken(
  //   jwtPayload,
  //   envVars.JWT_REFRESH_SECRET,
  //   envVars.JWT_REFRESH_EXPIRES
  // );

  // const userTokens = createUserTokens(isUserExist);

  // Don't wanna show password on frontend or backend response
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: pass, ...rest } = isUserExist.toObject();

  return {
    accessToken,
    // refreshToken: userTokens.refreshToken,
    // user: rest,
    email: isUserExist.email,
  };
};

export const AuthServices = {
  credentialsLogin,
};
