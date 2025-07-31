import { model, Schema } from "mongoose";
import { IAuthProvider, IUser, UserRole, UserStatus } from "./user.interface";

const authProviderSchema = new Schema<IAuthProvider>(
  {
    provider: { type: String, required: true },
    providerId: { type: String, required: true },
  },
  {
    versionKey: false,
    _id: false,
  }
);

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.Sender,
    },
    phone: { type: String, required: true },
    picture: { type: String },
    address: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.Active,
    },
    isDeleted: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    auths: {
      type: [authProviderSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const UserModel = model<IUser>("User", UserSchema);
