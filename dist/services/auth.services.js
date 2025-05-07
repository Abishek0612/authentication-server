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
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = __importDefault(require("../models/user.model"));
const mail_1 = __importDefault(require("../config/mail"));
const api_errors_1 = require("../utils/api-errors");
const token_model_1 = __importDefault(require("../models/token.model"));
const token_services_1 = __importDefault(require("./token.services"));
class AuthService {
    /**
     * Login user
     */
    static login(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password } = input;
            // Find user by email
            const user = yield user_model_1.default.findOne({ email }).populate("organization");
            if (!user) {
                throw new api_errors_1.UnauthorizedError("Invalid email or password");
            }
            // Check if password is correct
            const isPasswordValid = yield user.comparePassword(password);
            if (!isPasswordValid) {
                throw new api_errors_1.UnauthorizedError("Invalid email or password");
            }
            // Generate tokens
            const tokens = yield token_services_1.default.generateTokens(user._id.toString());
            return {
                tokens,
                isFirstLogin: user.isFirstLogin,
                userId: user._id.toString(),
            };
        });
    }
    /**
     * Reset password
     */
    static resetPassword(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, otp, password } = input;
            const user = yield user_model_1.default.findOne({
                email,
                resetPasswordCodeExpires: { $gt: new Date() },
            });
            if (!user) {
                throw new api_errors_1.BadRequestError("User not found or reset code expired");
            }
            const isValidOTP = yield user.compareResetCode(otp);
            if (!isValidOTP) {
                throw new api_errors_1.BadRequestError("Invalid reset code");
            }
            yield token_services_1.default.revokeAllTokens(user._id.toString());
            // Update password and mark user as not first login
            user.password = password;
            user.isFirstLogin = false;
            user.resetPasswordCode = undefined;
            user.resetPasswordCodeExpires = undefined;
            yield user.save();
            return { success: true };
        });
    }
    /**
     * First-time password change
     */
    static changeFirstTimePassword(userId, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield user_model_1.default.findById(userId);
            if (!user) {
                throw new api_errors_1.NotFoundError("User not found");
            }
            // Update password and mark as not first login
            user.password = newPassword;
            user.isFirstLogin = false;
            yield user.save();
            return { success: true };
        });
    }
    /**
     * Forgot password - send reset code
     */
    static forgotPassword(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield user_model_1.default.findOne({ email });
            if (!user) {
                throw new api_errors_1.NotFoundError("User not found");
            }
            const otp = token_services_1.default.generateOTP();
            const otpExpiry = new Date();
            otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // OTP valid for 10 minutes
            user.resetPasswordCode = otp;
            user.resetPasswordCodeExpires = otpExpiry;
            yield user.save();
            yield mail_1.default.sendPasswordResetEmail(email, otp);
            return { email: user.email };
        });
    }
    /**
     * Refresh tokens using refresh token
     */
    static refreshToken(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            return token_services_1.default.refreshTokens(refreshToken);
        });
    }
    /**
     * Logout user - invalidate refresh token
     */
    static logout(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            // Find and invalidate the refresh token
            const tokenDoc = yield token_model_1.default.findOneAndUpdate({ refreshToken, isActive: true }, { isActive: false });
            if (!tokenDoc) {
                throw new api_errors_1.UnauthorizedError("Invalid refresh token");
            }
            return { success: true };
        });
    }
}
exports.default = AuthService;
