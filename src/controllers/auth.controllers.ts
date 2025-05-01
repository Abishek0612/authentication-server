import { Request, Response } from "express";
import Joi from "joi";
import { validate } from "../middlewear/validation.middlewear";
import AuthService from "../services/auth.services";
import { catchAsync } from "../utils/catchAsync";

// Validation schemas
export const registerSchema = Joi.object({
  name: Joi.string().required().min(2).max(50),
  email: Joi.string().email().required(),
  password: Joi.string().required().min(6).max(50),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const verifyEmailSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string()
    .required()
    .length(6)
    .pattern(/^[0-9]+$/),
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const resetPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string()
    .required()
    .length(6)
    .pattern(/^[0-9]+$/),
  password: Joi.string().required().min(6).max(50),
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

export default class AuthController {
  /**
   * Register a new user
   * @route POST /api/auth/register
   */
  static register = [
    validate(registerSchema),
    catchAsync(async (req: Request, res: Response) => {
      const result = await AuthService.register(req.body);
      res.status(201).json({
        success: true,
        message:
          "Registration successful. Please check your email for verification code.",
        data: result,
      });
    }),
  ];

  /**
   * Verify email with OTP
   * @route POST /api/auth/verify-email
   */
  static verifyEmail = [
    validate(verifyEmailSchema),
    catchAsync(async (req: Request, res: Response) => {
      const tokens = await AuthService.verifyEmail(req.body);

      // Set refresh token in HTTP-only cookie
      res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: "strict",
      });

      res.status(200).json({
        success: true,
        message: "Email verified successfully",
        data: { accessToken: tokens.accessToken },
      });
    }),
  ];

  /**
   * Login user
   * @route POST /api/auth/login
   */
  static login = [
    validate(loginSchema),
    catchAsync(async (req: Request, res: Response) => {
      const tokens = await AuthService.login(req.body);

      // Set refresh token in HTTP-only cookie
      res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: "strict",
      });

      res.status(200).json({
        success: true,
        message: "Login successful",
        data: { accessToken: tokens.accessToken },
      });
    }),
  ];

  /**
   * Forgot password
   * @route POST /api/auth/forgot-password
   */
  static forgotPassword = [
    validate(forgotPasswordSchema),
    catchAsync(async (req: Request, res: Response) => {
      const result = await AuthService.forgotPassword(req.body);
      res.status(200).json({
        success: true,
        message: "Password reset instructions sent to your email",
        data: result,
      });
    }),
  ];

  /**
   * Reset password
   * @route POST /api/auth/reset-password
   */
  static resetPassword = [
    validate(resetPasswordSchema),
    catchAsync(async (req: Request, res: Response) => {
      const result = await AuthService.resetPassword(req.body);
      res.status(200).json({
        success: true,
        message: "Password reset successful",
        data: result,
      });
    }),
  ];

  /**
   * Refresh token
   * @route POST /api/auth/refresh-token
   */
  static refreshToken = [
    validate(refreshTokenSchema),
    catchAsync(async (req: Request, res: Response) => {
      const refreshToken = req.body.refreshToken || req.cookies.refreshToken;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: "Refresh token is required",
        });
      }

      const tokens = await AuthService.refreshToken(refreshToken);

      res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: "strict",
      });

      res.status(200).json({
        success: true,
        message: "Token refreshed successfully",
        data: { accessToken: tokens.accessToken },
      });
    }),
  ];

  /**
   * Logout user
   * @route POST /api/auth/logout
   */
  static logout = catchAsync(async (req: Request, res: Response) => {
    // Get refresh token from cookie
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      await AuthService.logout(refreshToken);
    }

    res.clearCookie("refreshToken");

    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  });

  /**
   * Resend verification email
   * @route POST /api/auth/resend-verification
   */
  static resendVerification = [
    validate(forgotPasswordSchema), // Reusing the schema as it requires just email
    catchAsync(async (req: Request, res: Response) => {
      const result = await AuthService.resendVerificationEmail(req.body.email);
      res.status(200).json({
        success: true,
        message: "Verification code resent. Please check your email.",
        data: result,
      });
    }),
  ];
}
