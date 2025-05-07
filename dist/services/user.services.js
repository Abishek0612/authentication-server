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
const api_errors_1 = require("../utils/api-errors");
class UserService {
    static getUserById(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield user_model_1.default.findById(userId).select("-password");
            if (!user) {
                throw new api_errors_1.NotFoundError("User not found");
            }
            return user;
        });
    }
    static updateUserProfile(userId, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield user_model_1.default.findByIdAndUpdate(userId, { $set: updateData }, { new: true, runValidators: true }).select("-password");
            if (!user) {
                throw new api_errors_1.NotFoundError("User not found");
            }
            return user;
        });
    }
    static getUsersByOrganization(organizationId) {
        return __awaiter(this, void 0, void 0, function* () {
            return user_model_1.default.find({ organization: organizationId })
                .select("-password")
                .sort({ createdAt: -1 });
        });
    }
    static changeUserRole(userId, role) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield user_model_1.default.findByIdAndUpdate(userId, { role }, { new: true, runValidators: true }).select("-password");
            if (!user) {
                throw new api_errors_1.NotFoundError("User not found");
            }
            return user;
        });
    }
    /**
     * Deactivate or activate a user
     * This doesn't delete the user but can be used to control access
     */
    static toggleUserStatus(userId, isActive) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield user_model_1.default.findByIdAndUpdate(userId, { isVerified: isActive }, { new: true }).select("-password");
            if (!user) {
                throw new api_errors_1.NotFoundError("User not found");
            }
            return user;
        });
    }
}
exports.default = UserService;
