import User from "../models/user.model";
import EmailService from "../config/mail";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "../utils/api-errors";
import Token from "../models/token.model";
import TokenService from "./token.services";
import {
  LoginInput,
  ResetPasswordInput,
  Tokens,
} from "../interface/user.interface";

export default class AuthService {
  static async login(input: LoginInput): Promise<{
    tokens: Tokens;
    isFirstLogin: boolean;
    userId: string;
  }> {
    const { email, password } = input;

    const user = await User.findOne({ email }).populate("organization");
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const tokens = await TokenService.generateTokens(user._id.toString());

    return {
      tokens,
      isFirstLogin: user.isFirstLogin,
      userId: user._id.toString(),
    };
  }

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

    user.password = password;
    user.isFirstLogin = false;
    user.resetPasswordCode = undefined;
    user.resetPasswordCodeExpires = undefined;
    await user.save();

    return { success: true };
  }

  static async changeFirstTimePassword(
    userId: string,
    newPassword: string
  ): Promise<{ success: boolean }> {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    user.password = newPassword;
    user.isFirstLogin = false;
    await user.save();

    return { success: true };
  }

  static async forgotPassword(email: string): Promise<{ email: string }> {
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

  static async refreshToken(refreshToken: string): Promise<Tokens> {
    return TokenService.refreshTokens(refreshToken);
  }

  static async logout(refreshToken: string): Promise<{ success: boolean }> {
    const tokenDoc = await Token.findOneAndUpdate(
      { refreshToken, isActive: true },
      { isActive: false }
    );

    if (!tokenDoc) {
      throw new UnauthorizedError("Invalid refresh token");
    }

    return { success: true };
  }
}
