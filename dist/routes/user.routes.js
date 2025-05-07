"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controllers_1 = __importDefault(require("../controllers/user.controllers"));
const auth_middlewear_1 = require("../middlewear/auth.middlewear");
const router = (0, express_1.Router)();
// Protected routes - require authentication
router.use(auth_middlewear_1.authenticateUser);
// User profile routes
router.get("/me", user_controllers_1.default.getCurrentUser);
router.put("/me", user_controllers_1.default.updateProfile);
exports.default = router;
