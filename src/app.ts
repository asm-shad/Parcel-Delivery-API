import cors from "cors";
import "./config/passport";
import { router } from "./routes";
import express, { Request, Response } from "express";
import notFound from "./middlewares/notFound";
import cookieParser from "cookie-parser";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import passport from "passport";
import expressSession from "express-session";

const app = express();

app.use(
  expressSession({
    secret: "dshffhsk",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());
app.use(express.json());
app.use(cors());

app.use("/api", router);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to Parcel Delivery API",
  });
});

app.use(globalErrorHandler);

app.use(notFound);

export default app;
