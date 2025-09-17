export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  SENDER = "SENDER",
  RECEIVER = "RECEIVER",
}

export enum IsActive {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  BLOCKED = "BLOCKED",
}

export interface IAuthProvider {
  provider: "google" | "credentials";
  providerId: string;
}

export interface IUser {
  _id?: string;
  name: string;
  email: string;
  password?: string;
  role?: UserRole;
  phone?: string;
  picture?: string;
  address?: string;
  isActive: IsActive;
  isDeleted?: boolean;
  isVerified?: boolean;
  auths: IAuthProvider[];
  createdAt?: Date;
  updatedAt?: Date;
}
