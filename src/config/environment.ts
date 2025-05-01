export const environment = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: process.env.PORT || 5000,
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",

  // JWT
  jwtAccessSecret:
    process.env.JWT_ACCESS_SECRET ||
    "8a4c89e2f31b50a5d60bdc5c6d7a0cd67db62e5c38f2f2f62a3d31b0787dc27ab92d9a0184b5473186dbbc4cd2deecfa6dbde386cf22137af121daf5d57c94e1",
  jwtRefreshSecret:
    process.env.JWT_REFRESH_SECRET ||
    "e27f3c52d8f9b4a6158d12e945a3119ee93d511fe186f2a78234085a639e2168492cbd95b63d0b2758458639eefd31d54bcd76d93a54cd8f9d96fe5b21bd0ec2",
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",

  // MongoDB
  mongodbUri:
    process.env.MONGODB_URI || "mongodb://localhost:27017/auth-system",

  // SMTP
  smtpHost: process.env.SMTP_HOST || "smtp.gmail.com",
  smtpPort: parseInt(process.env.SMTP_PORT || "587"),
  smtpUser: process.env.SMTP_USER || "uabishek6@gmail.com",
  smtpPassword: process.env.SMTP_PASSWORD || "qphk ioae tadw cxml",
  smtpSecure: process.env.SMTP_SECURE === "true",
};
