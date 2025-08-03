import { Router } from "express";
import { UserControllers } from "./user.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { createUserZodSchema, updateUserZodSchema } from "./user.validation";
import { checkAuth } from "../auth/checkAuth";
import { UserRole } from "./user.interface";

const router = Router();

router.post(
  "/register",
  validateRequest(createUserZodSchema),
  UserControllers.createUser
);
router.get(
  "/all-users",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  UserControllers.getAllUsers
);
router.patch(
  "/:id",
  validateRequest(updateUserZodSchema),
  checkAuth(...Object.values(UserRole)),
  UserControllers.updateUser
);

export const UserRoutes = router;
