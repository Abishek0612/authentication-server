require("dotenv").config();
const path = require("path");

const logger = {
  info: (message) => console.log(`[INFO] ${message}`),
  error: (message, error) => console.error(`[ERROR] ${message}`, error),
};

const distPath = path.resolve(__dirname, "../../dist");

const connectDB = require(path.join(distPath, "config/database")).default;

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
];

const createOrganizations = async () => {
  try {
    await connectDB();

    const Organization = require(path.join(
      distPath,
      "models/organization.model"
    )).default;

    const result = await Organization.create(organizations);
    logger.info(`Created ${result.length} organizations`);

    result.forEach((org) => {
      logger.info(`Organization: ${org.name}, Code: ${org.code}`);
    });

    logger.info("Organizations created successfully");
  } catch (error) {
    logger.error("Error creating organizations:", error);
    process.exit(1);
  }
};

createOrganizations();
