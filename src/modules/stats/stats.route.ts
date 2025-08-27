import express from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { StatsController } from "./stats.controller";
import { UserRole } from "../user/user.interface";

const router = express.Router();

router.get(
  "/parcel",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  StatsController.getParcelStats
);
router.get(
  "/user",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  StatsController.getUserStats
);

export const StatsRoutes = router;
