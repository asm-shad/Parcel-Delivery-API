export enum UserRole {
  Admin = "admin",
  Sender = "sender",
  Receiver = "receiver",
}

export enum UserStatus {
  Active = "active",
  Blocked = "blocked",
}

export interface IAuthProvider {
  provider: string;
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
  status?: UserStatus;
  isDeleted?: boolean;
  isVerified?: boolean;
  auths?: IAuthProvider[];
  createdAt?: Date;
  updatedAt?: Date;
}
