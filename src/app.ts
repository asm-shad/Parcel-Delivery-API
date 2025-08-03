import cors from "cors";
import { router } from "./routes";
import express, { Request, Response } from "express";
import notFound from "./middlewares/notFound";
import cookieParser from "cookie-parser";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";

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

app.use(globalErrorHandler);

app.use(notFound);

export default app;
