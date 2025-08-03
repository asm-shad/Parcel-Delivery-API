// import { Role } from "../user/user.interface";
// import passport from "passport";

import { Router } from "express";
import { AuthControllers } from "./auth.controller";
import { checkAuth } from "./checkAuth";
import { UserRole } from "../user/user.interface";

const router = Router();

router.post("/login", AuthControllers.credentialsLogin);
router.post("/refresh-token", AuthControllers.getNewAccessToken);
router.post("/logout", AuthControllers.logout);
router.post(
  "/reset-password",
  checkAuth(...Object.values(UserRole)),
  AuthControllers.resetPassword
);

// // /booking -> /login -> successful google login -> /booking frontend
// // /login -> successful google login -> / frontend
// router.get(
//   "/google",
//   async (req: Request, res: Response, next: NextFunction) => {
//     const redirect = req.query.redirect || "/";
//     passport.authenticate("google", {
//       scope: ["profile", "email"],
//       state: redirect as string,
//     })(req, res, next);
//   }
// );

// // api/v1/auth/google/callback?state=/booking
// router.get(
//   "/google/callback",
//   passport.authenticate("google", { failureRedirect: "/login" }),
//   AuthControllers.googleCallbackController
// );

export const AuthRoutes = router;
