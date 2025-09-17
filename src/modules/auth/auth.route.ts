import passport from "passport";
import { NextFunction, Request, Response, Router } from "express";
import { AuthControllers } from "./auth.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "../user/user.interface";
import { envVars } from "../../config/env";

const router = Router();

router.post("/login", AuthControllers.credentialsLogin);
router.post("/refresh-token", AuthControllers.getNewAccessToken);
router.post("/logout", AuthControllers.logout);
router.post(
  "/change-password",
  checkAuth(...Object.values(UserRole)),
  AuthControllers.changePassword
);
router.post(
  "/set-password",
  checkAuth(...Object.values(UserRole)),
  AuthControllers.setPassword
);
router.post("/forgot-password", AuthControllers.forgotPassword);
router.post(
  "/reset-password",
  checkAuth(...Object.values(UserRole)),
  AuthControllers.resetPassword
);

router.get(
  "/google",
  async (req: Request, res: Response, next: NextFunction) => {
    const redirect = req.query.redirect || "/";
    passport.authenticate("google", {
      scope: ["profile", "email"],
      state: redirect as string,
    })(req, res, next);
  }
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${envVars.FRONTEND_URL}/login?error=There is some issues with your account. Please contact with out support team!`,
  }),
  AuthControllers.googleCallbackController
);

export const AuthRoutes = router;
