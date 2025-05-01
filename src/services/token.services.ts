import jwt from "jsonwebtoken";
import crypto from "crypto";
import { Types } from "mongoose";
import { environment } from "../config/environment";
import Token from "../models/token.model";
import { UnauthorizedError } from "../utils/api-errors";
import { Tokens } from "../interface/user.interface";

export default class TokenService {
  /**
   * Generate access and refresh tokens
   */
  static async generateTokens(userId: string): Promise<Tokens> {
    const accessToken = jwt.sign({ userId }, environment.jwtAccessSecret, {
      expiresIn: environment.jwtAccessExpiresIn as any,
    });

    const refreshToken = jwt.sign({ userId }, environment.jwtRefreshSecret, {
      expiresIn: environment.jwtRefreshExpiresIn as any,
    });

    const decodedRefreshToken = jwt.decode(refreshToken) as { exp: number };
    const expiresAt = new Date(decodedRefreshToken.exp * 1000);

    await Token.create({
      userId: new Types.ObjectId(userId),
      refreshToken,
      expiresAt,
      isActive: true,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Verify refresh token and generate new tokens
   */
  static async refreshTokens(refreshToken: string): Promise<Tokens> {
    try {
      const payload = jwt.verify(
        refreshToken,
        environment.jwtRefreshSecret
      ) as { userId: string };

      const tokenDoc = await Token.findOne({
        refreshToken,
        isActive: true,
        expiresAt: { $gt: new Date() },
      });

      if (!tokenDoc) {
        throw new UnauthorizedError("Invalid refresh token");
      }

      await Token.findByIdAndUpdate(tokenDoc._id, { isActive: false });

      return this.generateTokens(payload.userId);
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError("Invalid or expired refresh token");
      }
      throw error;
    }
  }

  /**
   * Invalidate all refresh tokens for a user
   */
  static async revokeAllTokens(userId: string): Promise<void> {
    await Token.updateMany(
      { userId: new Types.ObjectId(userId), isActive: true },
      { isActive: false }
    );
  }

  /**
   * Generate random OTP
   */
  static generateOTP(length = 6): string {
    return crypto.randomInt(100000, 999999).toString().padStart(length, "0");
  }
}
