import { Response } from "express";

interface TMeta {
  page: number;
  limit: number;
  totalPage: number;
  total: number;
}

interface TResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
  meta?: TMeta; // statistc calculation of data like how many user u have or in which page u are
}

export const sendResponse = <T>(res: Response, data: TResponse<T>) => {
  res.status(data.statusCode).json({
    statusCode: data.statusCode,
    success: data.success,
    message: data.message,
    meta: data.meta,
    data: data.data,
  });
};
