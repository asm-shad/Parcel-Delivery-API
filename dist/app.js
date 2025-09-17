"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
require("./config/passport");
const routes_1 = require("./routes");
const express_1 = __importDefault(require("express"));
const notFound_1 = __importDefault(require("./middlewares/notFound"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const globalErrorHandler_1 = require("./middlewares/globalErrorHandler");
const passport_1 = __importDefault(require("passport"));
const express_session_1 = __importDefault(require("express-session"));
const env_1 = require("./config/env");
const app = (0, express_1.default)();
app.use((0, express_session_1.default)({
    secret: "dshffhsk",
    resave: false,
    saveUninitialized: false,
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)({
    origin: [env_1.envVars.FRONTEND_URL, "https://parcelo-iota.vercel.app"],
    credentials: true,
}));
app.use("/api", routes_1.router);
app.get("/", (req, res) => {
    res.status(200).json({
        message: "Welcome to Parcel Delivery API",
    });
});
app.use(globalErrorHandler_1.globalErrorHandler);
app.use(notFound_1.default);
exports.default = app;
