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
exports.requireRole = exports.authenticateUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const api_errors_1 = require("../utils/api-errors");
const user_model_1 = __importDefault(require("../models/user.model"));
const organization_model_1 = __importDefault(require("../models/organization.model"));
const environment_1 = require("../config/environment");
const user_interface_1 = require("../interface/user.interface");
const authenticateUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new api_errors_1.UnauthorizedError("Authentication required");
        }
        const token = authHeader.split(" ")[1];
        const payload = jsonwebtoken_1.default.verify(token, environment_1.environment.jwtAccessSecret);
        if (payload.role !== user_interface_1.UserRole.SUPER_ADMIN && payload.organization) {
            const organization = yield organization_model_1.default.findById(payload.organization);
            if (!organization || organization.status !== "active") {
                throw new api_errors_1.UnauthorizedError("Organization not found or inactive");
            }
        }
        const user = yield user_model_1.default.findById(payload.userId).select("-password");
        if (!user) {
            throw new api_errors_1.UnauthorizedError("User not found");
        }
        req.user = user.toObject();
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            next(new api_errors_1.UnauthorizedError("Invalid or expired token"));
        }
        else {
            next(error);
        }
    }
});
exports.authenticateUser = authenticateUser;
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new api_errors_1.UnauthorizedError("Authentication required"));
        }
        if (!roles.includes(req.user.role)) {
            return next(new api_errors_1.ForbiddenError("You don't have permission to access this resource"));
        }
        next();
    };
};
exports.requireRole = requireRole;
