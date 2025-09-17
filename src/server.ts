import { Server } from "http";
import mongoose from "mongoose";
import { envVars } from "./config/env";
import app from "./app";
import { seedSuperAdmin } from "./utils/seedSuperAdmin";
import { connectRedis } from "./config/redis.config";

let server: Server;

const startServer = async () => {
  try {
    await mongoose.connect(envVars.DB_URL);
    console.log("Connected to DB!");

    server = app.listen(envVars.PORT, () => {
      console.log(`Server is listening to port ${envVars.PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

(async () => {
  await connectRedis();
  await startServer();
  await seedSuperAdmin();
})();

// unhandled rejection error
process.on("unhandledRejection", (err) => {
  console.log("Unhandled Rejection detected... Server shutting down.", err);

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }

  process.exit(1);
});

// uncaught rejection error
process.on("uncaughtException", (err) => {
  console.log("Uncaught Exception detected... Server shutting down.", err);

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }

  process.exit(1);
});

// signal termination -> sigterm
process.on("SIGTERM", () => {
  console.log("SIGTERM signal recieved... Server shutting down.");

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }

  process.exit(1);
});

// signal termination -> SIGINT
process.on("SIGINT", () => {
  console.log("SIGINT signal recieved... Server shutting down.");

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }

  process.exit(1);
});
