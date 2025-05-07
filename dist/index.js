"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const app_1 = __importDefault(require("./app"));
const database_1 = __importDefault(require("./config/database"));
const logger_1 = __importDefault(require("./config/logger"));
const PORT = process.env.PORT || 5000;
// Connect to MongoDB
(0, database_1.default)();
app_1.default.listen(PORT, () => {
    logger_1.default.info(`Server running on port ${PORT}`);
});
