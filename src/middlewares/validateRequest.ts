import { NextFunction, Request, Response } from "express";
import { AnyZodObject } from "zod";

export const validateRequest =
  (zodSchema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // sanitize data
      req.body = await zodSchema.parseAsync(req.body);

      console.log(req.body);

      next();
    } catch (err) {
      console.log(err);
      next(err);
    }
  };
