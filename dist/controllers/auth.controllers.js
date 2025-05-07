"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.loginSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const validation_middlewear_1 = require("../middlewear/validation.middlewear");
const auth_services_1 = __importDefault(require("../services/auth.services"));
const catchAsync_1 = require("../utils/catchAsync");
// Validation schemas
exports.loginSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().required(),
});
exports.forgotPasswordSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
});
exports.resetPasswordSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    otp: joi_1.default.string()
        .required()
        .length(6)
        .pattern(/^[0-9]+$/),
    password: joi_1.default.string().required().min(6).max(50),
});
exports.changePasswordSchema = joi_1.default.object({
    password: joi_1.default.string().required().min(6).max(50),
});
class AuthController {
}
_a = AuthController;
/**
 * Login user
 * @route POST /api/auth/login
 */
AuthController.login = [
    (0, validation_middlewear_1.validate)(exports.loginSchema),
    (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield auth_services_1.default.login(req.body);
        res.cookie("refreshToken", result.tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            sameSite: "strict",
        });
        res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                accessToken: result.tokens.accessToken,
                isFirstLogin: result.isFirstLogin,
                userId: result.userId,
            },
        });
    })),
];
/**
 * Change first-time password
 * @route POST /api/auth/change-password
 */
AuthController.changeFirstTimePassword = [
    (0, validation_middlewear_1.validate)(exports.changePasswordSchema),
    (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }
        const result = yield auth_services_1.default.changeFirstTimePassword(req.user._id.toString(), req.body.password);
        res.status(200).json({
            success: true,
            message: "Password changed successfully",
            data: result,
        });
    })),
];
/**
 * Forgot password
 * @route POST /api/auth/forgot-password
 */
AuthController.forgotPassword = [
    (0, validation_middlewear_1.validate)(exports.forgotPasswordSchema),
    (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield auth_services_1.default.forgotPassword(req.body.email);
        res.status(200).json({
            success: true,
            message: "Password reset instructions sent to your email",
            data: result,
        });
    })),
];
/**
 * Reset password
 * @route POST /api/auth/reset-password
 */
AuthController.resetPassword = [
    (0, validation_middlewear_1.validate)(exports.resetPasswordSchema),
    (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield auth_services_1.default.resetPassword(req.body);
        res.status(200).json({
            success: true,
            message: "Password reset successful",
            data: result,
        });
    })),
];
/**
 * Refresh token
 * @route POST /api/auth/refresh-token
 */
AuthController.refreshToken = [
    (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: "Refresh token is required",
            });
        }
        const tokens = yield auth_services_1.default.refreshToken(refreshToken);
        res.cookie("refreshToken", tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            sameSite: "strict",
        });
        res.status(200).json({
            success: true,
            message: "Token refreshed successfully",
            data: { accessToken: tokens.accessToken },
        });
    })),
];
/**
 * Logout user
 * @route POST /api/auth/logout
 */
AuthController.logout = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
        yield auth_services_1.default.logout(refreshToken);
    }
    res.clearCookie("refreshToken");
    res.status(200).json({
        success: true,
        message: "Logout successful",
    });
}));
exports.default = AuthController;
