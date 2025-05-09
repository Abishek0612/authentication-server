require("dotenv").config();
const path = require("path");

const logger = {
  info: (message) => console.log(`[INFO] ${message}`),
  error: (message, error) => console.error(`[ERROR] ${message}`, error),
};

const distPath = path.resolve(__dirname, "../../dist");

const connectDB = require(path.join(distPath, "config/database")).default;
const { Status } = require(path.join(distPath, "interface/user.interface"));

const UserRole = {
  USER: "USER",
  ADMIN: "ADMIN",
  SUPER_ADMIN: "SUPER_ADMIN",
};

const users = [
  {
    firstName: "Admin",
    lastName: "test",
    email: "multiford1@test.com",
    password: "test123",
    organizationCode: "MUL123",
    role: UserRole.ADMIN,
    status: Status.ACTIVE,
  },
  {
    firstName: "Jane",
    lastName: "Smith",
    email: "multiford2@test.com",
    password: "test123",
    organizationCode: "TST456",
    role: UserRole.USER,
    status: Status.ACTIVE,
  },
  {
    firstName: "Super",
    lastName: "Admin",
    email: "multiford3@test.com",
    password: "admin123",
    organizationCode: "MUL123",
    role: UserRole.SUPER_ADMIN,
    status: Status.ACTIVE,
  },
];

const createUsers = async () => {
  try {
    await connectDB();

    const Organization = require(path.join(
      distPath,
      "models/organization.model"
    )).default;
    const User = require(path.join(distPath, "models/user.model")).default;

    const organizations = await Organization.find({});
    const orgMap = {};
    organizations.forEach((org) => {
      orgMap[org.code] = org._id;
    });

    const userData = users
      .map((user) => {
        const orgId = orgMap[user.organizationCode];
        if (!orgId) {
          logger.error(
            `Organization with code ${user.organizationCode} not found for user ${user.email}`
          );
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

    const result = await User.create(userData);
    logger.info(`Created ${result.length} users successfully`);

    result.forEach((user) => {
      const originalUser = users.find((u) => u.email === user.email);
      logger.info(
        `User: ${user.firstName} ${user.lastName}, Email: ${user.email}, Password: ${originalUser.password}, Role: ${user.role}`
      );
    });

    logger.info("Users created successfully");
  } catch (error) {
    logger.error("Error creating users:", error);
    process.exit(1);
  }
};

createUsers();

// ! status ( in user schema)  ( enum: active, inactive, delete )
