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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const mongoose_1 = require("mongoose");
const environment_1 = require("../config/environment");
const token_model_1 = __importDefault(require("../models/token.model"));
const api_errors_1 = require("../utils/api-errors");
const user_model_1 = __importDefault(require("../models/user.model"));
class TokenService {
    static generateTokens(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield user_model_1.default.findById(userId);
            if (!user) {
                throw new Error("User not found");
            }
            const tokenPayload = {
                userId,
                role: user.role,
            };
            if (user.organization) {
                tokenPayload.organization = user.organization.toString();
            }
            const accessToken = jsonwebtoken_1.default.sign(tokenPayload, environment_1.environment.jwtAccessSecret, {
                expiresIn: environment_1.environment.jwtAccessExpiresIn,
            });
            const refreshToken = jsonwebtoken_1.default.sign(tokenPayload, environment_1.environment.jwtRefreshSecret, {
                expiresIn: environment_1.environment.jwtRefreshExpiresIn,
            });
            const decodedRefreshToken = jsonwebtoken_1.default.decode(refreshToken);
            const expiresAt = new Date(decodedRefreshToken.exp * 1000);
            yield token_model_1.default.create({
                userId: new mongoose_1.Types.ObjectId(userId),
                refreshToken,
                expiresAt,
                isActive: true,
            });
            return {
                accessToken,
                refreshToken,
            };
        });
    }
    static refreshTokens(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const payload = jsonwebtoken_1.default.verify(refreshToken, environment_1.environment.jwtRefreshSecret);
                const tokenDoc = yield token_model_1.default.findOne({
                    refreshToken,
                    isActive: true,
                    expiresAt: { $gt: new Date() },
                });
                if (!tokenDoc) {
                    throw new api_errors_1.UnauthorizedError("Invalid refresh token");
                }
                yield token_model_1.default.findByIdAndUpdate(tokenDoc._id, { isActive: false });
                return this.generateTokens(payload.userId);
            }
            catch (error) {
                if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                    throw new api_errors_1.UnauthorizedError("Invalid or expired refresh token");
                }
                throw error;
            }
        });
    }
    static revokeAllTokens(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield token_model_1.default.updateMany({ userId: new mongoose_1.Types.ObjectId(userId), isActive: true }, { isActive: false });
        });
    }
    static generateOTP(length = 6) {
        return crypto_1.default.randomInt(100000, 999999).toString().padStart(length, "0");
    }
}
exports.default = TokenService;
