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
const nodemailer_1 = __importDefault(require("nodemailer"));
const logger_1 = __importDefault(require("./logger"));
const environment_1 = require("./environment");
class EmailService {
    constructor() {
        this.isDevelopment = process.env.NODE_ENV !== "production";
        this.transporter = nodemailer_1.default.createTransport({
            host: environment_1.environment.smtpHost,
            port: environment_1.environment.smtpPort,
            secure: environment_1.environment.smtpSecure,
            auth: {
                user: environment_1.environment.smtpUser,
                pass: environment_1.environment.smtpPassword,
            },
            tls: {
                rejectUnauthorized: false,
            },
        });
        this.verifyConnection();
    }
    /**
     * Verify SMTP connection on initialization
     */
    verifyConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.transporter.verify();
                logger_1.default.info("SMTP server connection established successfully");
                logger_1.default.info(`Using email account: ${environment_1.environment.smtpUser}`);
            }
            catch (error) {
                logger_1.default.error("SMTP connection verification failed:", error);
                logger_1.default.warn("Email sending may not work. Check your Gmail settings and credentials.");
                if (!environment_1.environment.smtpUser) {
                    logger_1.default.error("SMTP user (email address) is not set. Please update your environment configuration.");
                }
                if (!environment_1.environment.smtpPassword) {
                    logger_1.default.error("SMTP password is not set. Please update your environment configuration.");
                }
            }
        });
    }
    /**
     * Send an email
     */
    sendEmail(_a) {
        return __awaiter(this, arguments, void 0, function* ({ to, subject, html }) {
            if (this.isDevelopment) {
                logger_1.default.info("=== EMAIL SENDING ATTEMPT (DEV MODE) ===");
                logger_1.default.info(`From: ${environment_1.environment.smtpUser}`);
                logger_1.default.info(`To: ${to}`);
                logger_1.default.info(`Subject: ${subject}`);
                logger_1.default.info(`Using SMTP Server: ${environment_1.environment.smtpHost}:${environment_1.environment.smtpPort}`);
                logger_1.default.info("=== END EMAIL DETAILS ===");
            }
            try {
                const mailOptions = {
                    from: `"Auth System" <${environment_1.environment.smtpUser}>`,
                    to,
                    subject,
                    html,
                };
                const info = yield this.transporter.sendMail(mailOptions);
                logger_1.default.info(`Email sent to ${to}, Message ID: ${info.messageId}`);
                if (this.isDevelopment) {
                    logger_1.default.info(`Preview URL: ${nodemailer_1.default.getTestMessageUrl(info)}`);
                    if (info.accepted.length > 0) {
                        logger_1.default.info(`Email accepted by: ${info.accepted.join(", ")}`);
                    }
                    if (info.rejected.length > 0) {
                        logger_1.default.warn(`Email rejected by: ${info.rejected.join(", ")}`);
                    }
                }
            }
            catch (error) {
                logger_1.default.error("Error sending email:", error);
                if (error.message.includes("Invalid login")) {
                    logger_1.default.error("Authentication failed: Check your Gmail username and password/App Password");
                    logger_1.default.error("If using Gmail with 2FA, ensure you're using an App Password");
                }
                else if (error.message.includes("Rate limit")) {
                    logger_1.default.error("Gmail rate limit exceeded. Try again later or consider a dedicated email service");
                }
                throw new Error("Failed to send email");
            }
        });
    }
    /**
     * Send verification email with OTP
     */
    sendVerificationEmail(email, otp) {
        return __awaiter(this, void 0, void 0, function* () {
            const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0284c7; text-align: center;">Verify Your Email</h2>
        <p>Thank you for registering with our service. To complete your registration, please use the following OTP code:</p>
        <div style="background-color: #f0f9ff; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
          <h1 style="color: #0284c7; margin: 0; letter-spacing: 5px;">${otp}</h1>
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
      </div>
    `;
            try {
                yield this.sendEmail({
                    to: email,
                    subject: "Email Verification Code",
                    html,
                });
            }
            catch (error) {
                if (this.isDevelopment) {
                    logger_1.default.warn("Email sending failed, but providing OTP for development testing");
                    logger_1.default.info(`==== DEVELOPMENT FALLBACK ====`);
                    logger_1.default.info(`Verification OTP for ${email}: ${otp}`);
                    logger_1.default.info(`=============================`);
                    if (!this.isDevelopment) {
                        throw error;
                    }
                }
                else {
                    throw error;
                }
            }
        });
    }
    /**
     * Send password reset email with OTP
     */
    sendPasswordResetEmail(email, otp) {
        return __awaiter(this, void 0, void 0, function* () {
            const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0284c7; text-align: center;">Reset Your Password</h2>
        <p>We received a request to reset your password. Please use the following OTP code to reset your password:</p>
        <div style="background-color: #f0f9ff; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
          <h1 style="color: #0284c7; margin: 0; letter-spacing: 5px;">${otp}</h1>
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
      </div>
    `;
            try {
                yield this.sendEmail({
                    to: email,
                    subject: "Password Reset Code",
                    html,
                });
            }
            catch (error) {
                if (this.isDevelopment) {
                    logger_1.default.warn("Email sending failed, but providing OTP for development testing");
                    logger_1.default.info(`==== DEVELOPMENT FALLBACK ====`);
                    logger_1.default.info(`Password Reset OTP for ${email}: ${otp}`);
                    logger_1.default.info(`=============================`);
                    if (!this.isDevelopment) {
                        throw error;
                    }
                }
                else {
                    throw error;
                }
            }
        });
    }
}
exports.default = new EmailService();
