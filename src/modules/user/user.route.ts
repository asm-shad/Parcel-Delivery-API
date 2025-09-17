import { Router } from "express";
import { UserControllers } from "./user.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { createUserZodSchema, updateUserZodSchema } from "./user.validation";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "./user.interface";
import { multerUpload } from "../../config/multer.config";

const router = Router();

router.post(
  "/register",
  validateRequest(createUserZodSchema),
  UserControllers.createUser
);

router.get(
  "/all-users",
  checkAuth(...Object.values(UserRole)),
  UserControllers.getAllUsers
);

router.get("/me", checkAuth(...Object.values(UserRole)), UserControllers.getMe);

router.patch(
  "/:id",
  checkAuth(...Object.values(UserRole)),
  multerUpload.single("file"),
  validateRequest(updateUserZodSchema),
  UserControllers.updateUser
);

router.patch(
  "/status/:id",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  UserControllers.updateUserStatus
);

router.get(
  "/:id",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  UserControllers.getSingleUser
);

router.delete(
  "/:id",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  UserControllers.deleteUser
);

export const UserRoutes = router;
