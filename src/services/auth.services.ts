import User from "../models/user.model";
import EmailService from "../config/mail";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../utils/api-errors";
import Token from "../models/token.model";
import TokenService from "./token.services";
import {
  RegisterInput,
  LoginInput,
  VerifyEmailInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  Tokens,
} from "../interface/user.interface";

export default class AuthService {
  /**
   * Register a new user
   */
  static async register(input: RegisterInput): Promise<{ email: string }> {
    const { name, email, password } = input;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ConflictError("Email already in use");
    }

    const otp = TokenService.generateOTP();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 10);

    const user = await User.create({
      name,
      email,
      password,
      verificationCode: otp,
      verificationCodeExpires: otpExpiry,
    });

    await EmailService.sendVerificationEmail(email, otp);

    return { email: user.email };
  }

  /**
   * Verify email with OTP
   */
  static async verifyEmail(input: VerifyEmailInput): Promise<Tokens> {
    const { email, otp } = input;

    const user = await User.findOne({
      email,
      verificationCodeExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new BadRequestError("User not found or verification code expired");
    }

    const isValidOTP = await user.compareVerificationCode(otp);
    if (!isValidOTP) {
      throw new BadRequestError("Invalid verification code");
    }

    // Update user as verified
    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    // Generate tokens
    return TokenService.generateTokens(user._id.toString());
  }

  /**
   * Login user
   */
  static async login(input: LoginInput): Promise<Tokens> {
    const { email, password } = input;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    // Check if password is correct
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    // Check if user is verified
    if (!user.isVerified) {
      throw new UnauthorizedError("Email not verified");
    }

    // Generate tokens
    return TokenService.generateTokens(user._id.toString());
  }

  /**
   * Forgot password - send reset code
   */
  static async forgotPassword(
    input: ForgotPasswordInput
  ): Promise<{ email: string }> {
    const { email } = input;

    const user = await User.findOne({ email });
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const otp = TokenService.generateOTP();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // OTP valid for 10 minutes

    user.resetPasswordCode = otp;
    user.resetPasswordCodeExpires = otpExpiry;
    await user.save();

    await EmailService.sendPasswordResetEmail(email, otp);

    return { email: user.email };
  }

  /**
   * Reset password with OTP
   */
  static async resetPassword(
    input: ResetPasswordInput
  ): Promise<{ success: boolean }> {
    const { email, otp, password } = input;

    const user = await User.findOne({
      email,
      resetPasswordCodeExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new BadRequestError("User not found or reset code expired");
    }

    const isValidOTP = await user.compareResetCode(otp);
    if (!isValidOTP) {
      throw new BadRequestError("Invalid reset code");
    }

    await TokenService.revokeAllTokens(user._id.toString());

    // Update password
    user.password = password;
    user.resetPasswordCode = undefined;
    user.resetPasswordCodeExpires = undefined;
    await user.save();

    return { success: true };
  }

  /**
   * Refresh tokens using refresh token
   */
  static async refreshToken(refreshToken: string): Promise<Tokens> {
    return TokenService.refreshTokens(refreshToken);
  }

  /**
   * Logout user - invalidate refresh token
   */
  static async logout(refreshToken: string): Promise<{ success: boolean }> {
    // Find and invalidate the refresh token
    const tokenDoc = await Token.findOneAndUpdate(
      { refreshToken, isActive: true },
      { isActive: false }
    );

    if (!tokenDoc) {
      throw new UnauthorizedError("Invalid refresh token");
    }

    return { success: true };
  }

  /**
   * Resend verification email
   */
  static async resendVerificationEmail(
    email: string
  ): Promise<{ email: string }> {
    const user = await User.findOne({ email, isVerified: false });
    if (!user) {
      throw new NotFoundError("User not found or already verified");
    }

    const otp = TokenService.generateOTP();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 10);

    user.verificationCode = otp;
    user.verificationCodeExpires = otpExpiry;
    await user.save();

    await EmailService.sendVerificationEmail(email, otp);

    return { email: user.email };
  }
}
