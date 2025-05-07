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
exports.updateProfileSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const user_services_1 = __importDefault(require("../services/user.services"));
const catchAsync_1 = require("../utils/catchAsync");
const validation_middlewear_1 = require("../middlewear/validation.middlewear");
// Validation schema
exports.updateProfileSchema = joi_1.default.object({
    name: joi_1.default.string().min(2).max(50),
});
class UserController {
}
_a = UserController;
/**
 * Get current user profile
 * @route GET /api/users/me
 */
UserController.getCurrentUser = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Authentication required",
        });
    }
    res.status(200).json({
        success: true,
        data: req.user,
    });
}));
/**
 * Update user profile
 * @route PUT /api/users/me
 */
UserController.updateProfile = [
    (0, validation_middlewear_1.validate)(exports.updateProfileSchema),
    (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }
        const updatedUser = yield user_services_1.default.updateUserProfile(req.user._id.toString(), req.body);
        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: updatedUser,
        });
    })),
];
exports.default = UserController;
