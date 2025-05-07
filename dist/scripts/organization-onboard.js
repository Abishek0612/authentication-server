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
Object.defineProperty(exports, "__esModule", { value: true });
// Organization onboarding script
require("dotenv").config();
const path = require("path");
// Import the database connection from your existing code
const connectDB = require("../dist/config/database").default;
// Import the logger for consistent logging
const logger = require("../dist/config/logger").default;
// Define the hardcoded organization data
const organizations = [
    {
        name: "Multifold",
        code: "MUL123",
        status: "active",
    },
    {
        name: "TestOrg",
        code: "TST456",
        status: "active",
    },
    // Add more organizations as needed
];
// Main function to create organizations
function createOrganizations() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Connect to the database using your existing connection
            yield connectDB();
            // Import the Organization model after connection is established
            const Organization = require("../dist/models/organization.model").default;
            // Create organizations
            const result = yield Organization.create(organizations);
            logger.info(`Created ${result.length} organizations successfully`);
            // Log each created organization
            result.forEach((org) => {
                logger.info(`Organization: ${org.name}, Code: ${org.code}`);
            });
            logger.info("Organization onboarding completed");
        }
        catch (error) {
            logger.error("Error creating organizations:", error);
            process.exit(1);
        }
    });
}
// Run the script
createOrganizations();
