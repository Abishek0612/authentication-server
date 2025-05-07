"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controllers_1 = __importDefault(require("../controllers/auth.controllers"));
const auth_middlewear_1 = require("../middlewear/auth.middlewear");
const router = (0, express_1.Router)();
// Login and token management
router.post("/login", auth_controllers_1.default.login);
router.post("/refresh-token", auth_controllers_1.default.refreshToken);
router.post("/logout", auth_controllers_1.default.logout);
// Password management
router.post("/forgot-password", auth_controllers_1.default.forgotPassword);
router.post("/reset-password", auth_controllers_1.default.resetPassword);
// Protected routes - require authentication
router.use(auth_middlewear_1.authenticateUser);
router.post("/change-password", auth_controllers_1.default.changeFirstTimePassword);
exports.default = router;
