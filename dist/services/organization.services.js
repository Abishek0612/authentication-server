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
const organization_model_1 = __importDefault(require("../models/organization.model"));
const api_errors_1 = require("../utils/api-errors");
class OrganizationService {
    /**
     * Create a new organization
     */
    static createOrganization(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, code } = input;
            // Check if organization with same code already exists
            const existingOrg = yield organization_model_1.default.findOne({ code });
            if (existingOrg) {
                throw new api_errors_1.ConflictError(`Organization with code ${code} already exists`);
            }
            // Create organization
            const organization = yield organization_model_1.default.create({
                name,
                code,
                status: input.status !== undefined ? input.status : true,
            });
            return organization;
        });
    }
    /**
     * Get organization by ID
     */
    static getOrganizationById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const organization = yield organization_model_1.default.findById(id);
            if (!organization) {
                throw new api_errors_1.NotFoundError("Organization not found");
            }
            return organization;
        });
    }
    /**
     * Get organization by code
     */
    static getOrganizationByCode(code) {
        return __awaiter(this, void 0, void 0, function* () {
            const organization = yield organization_model_1.default.findOne({ code });
            if (!organization) {
                throw new api_errors_1.NotFoundError(`Organization with code ${code} not found`);
            }
            return organization;
        });
    }
    /**
     * Update organization status
     */
    static updateOrganizationStatus(id, status) {
        return __awaiter(this, void 0, void 0, function* () {
            const organization = yield organization_model_1.default.findByIdAndUpdate(id, { status }, { new: true });
            if (!organization) {
                throw new api_errors_1.NotFoundError("Organization not found");
            }
            return organization;
        });
    }
    /**
     * Get all organizations
     */
    static getAllOrganizations() {
        return __awaiter(this, void 0, void 0, function* () {
            return organization_model_1.default.find({});
        });
    }
}
exports.default = OrganizationService;
