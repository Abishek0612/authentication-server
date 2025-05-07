"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_errors_1 = require("../utils/api-errors");
const logger_1 = __importDefault(require("../config/logger"));
const errorMiddleware = (err, req, res, next) => {
    console.log("Error middleware called:", err.message);
    if (err instanceof api_errors_1.ApiError) {
        const { statusCode, message, isOperational } = err;
        if (isOperational) {
            res.status(statusCode).json({
                success: false,
                message,
            });
            return;
        }
        logger_1.default.error("Unexpected error:", err);
    }
    else {
        logger_1.default.error("Unexpected error:", err);
    }
    // No return needed here either
    res.status(500).json({
        success: false,
        message: "Something went wrong",
    });
};
exports.default = errorMiddleware;
