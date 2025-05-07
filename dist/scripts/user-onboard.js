var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// User onboarding script
require("dotenv").config();
const mongoose = require("mongoose");
const path = require("path");
// Import the database connection from your existing code
const connectDB = require("../dist/config/database").default;
// Import the logger for consistent logging
const logger = require("../dist/config/logger").default;
// Define the UserRole enum to match your TypeScript definition
const UserRole = {
    USER: "USER",
    ADMIN: "ADMIN",
    SUPER_ADMIN: "SUPER_ADMIN",
};
// Define the hardcoded user data with roles
const users = [
    {
        firstName: "John",
        lastName: "Doe",
        email: "john@test.com",
        password: "test123",
        organizationCode: "MUL123",
        role: UserRole.ADMIN,
    },
    {
        firstName: "Jane",
        lastName: "Smith",
        email: "jane@test.com",
        password: "test123",
        organizationCode: "TST456",
        role: UserRole.USER,
    },
    {
        firstName: "Super",
        lastName: "Admin",
        email: "admin@test.com",
        password: "admin123",
        organizationCode: "MUL123",
        role: UserRole.SUPER_ADMIN,
    },
    // Add more users as needed
];
// Main function to create users
function createUsers() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Connect to the database using your existing connection
            yield connectDB();
            // Import models after connection is established
            const Organization = require("../dist/models/organization.model").default;
            const User = require("../dist/models/user.model").default;
            // Get all organizations to map codes to IDs
            const organizations = yield Organization.find({});
            const orgMap = {};
            organizations.forEach((org) => {
                orgMap[org.code] = org._id;
            });
            // Prepare user data with organization IDs
            const userData = users
                .map((user) => {
                const orgId = orgMap[user.organizationCode];
                if (!orgId) {
                    logger.error(`Organization with code ${user.organizationCode} not found for user ${user.email}`);
                    return null;
                }
                return {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    password: user.password,
                    organization: orgId,
                    role: user.role,
                    isFirstLogin: true,
                };
            })
                .filter((user) => user !== null);
            // Create users
            const result = yield User.create(userData);
            logger.info(`Created ${result.length} users successfully`);
            // Log each created user with their password for sharing
            result.forEach((user) => {
                const originalUser = users.find((u) => u.email === user.email);
                logger.info(`User: ${user.firstName} ${user.lastName}, Email: ${user.email}, Password: ${originalUser.password}, Role: ${user.role}`);
            });
            logger.info("User onboarding completed");
        }
        catch (error) {
            logger.error("Error creating users:", error);
            process.exit(1);
        }
    });
}
// Run the script
createUsers();
