import mongoose from "mongoose";

export interface IUser {
  __id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  isVerified: boolean;
  verificationCode?: string;
  verificationCodeExpires?: Date;
  resetPasswordCode?: string;
  resetPasswordCodeExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type UserDocument = Document & IUser;

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface VerifyEmailInput {
  email: string;
  otp: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  email: string;
  otp: string;
  password: string;
}

export interface TokenPayload {
  userId: string;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}
