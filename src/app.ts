import cors from "cors";
import { router } from "./routes";
import express, { Request, Response } from "express";
// import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
import notFound from "./middlewares/notFound";
import cookieParser from "cookie-parser";

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(cors());

app.use("/api", router);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to Parcel Delivery API",
  });
});

// direct function we didn't do any route matching, same as globalErrorHandler
app.use(notFound);

export default app;
