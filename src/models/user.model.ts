import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
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
  comparePassword(candidatePassword: string): Promise<boolean>;
  compareVerificationCode(code: string): Promise<boolean>;
  compareResetCode(code: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: String,
    },
    verificationCodeExpires: {
      type: Date,
    },
    resetPasswordCode: {
      type: String,
    },
    resetPasswordCodeExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
      return next(error as Error);
    }
  }

  // Hash verification code
  if (this.isModified("verificationCode") && this.verificationCode) {
    try {
      const salt = await bcrypt.genSalt(8);
      this.verificationCode = await bcrypt.hash(this.verificationCode, salt);
    } catch (error) {
      return next(error as Error);
    }
  }

  // Hash reset password code
  if (this.isModified("resetPasswordCode") && this.resetPasswordCode) {
    try {
      const salt = await bcrypt.genSalt(8);
      this.resetPasswordCode = await bcrypt.hash(this.resetPasswordCode, salt);
    } catch (error) {
      return next(error as Error);
    }
  }

  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to compare verification code
userSchema.methods.compareVerificationCode = async function (
  candidateCode: string
): Promise<boolean> {
  if (!this.verificationCode) return false;
  return bcrypt.compare(candidateCode, this.verificationCode);
};

// Method to compare reset password code
userSchema.methods.compareResetCode = async function (
  candidateCode: string
): Promise<boolean> {
  if (!this.resetPasswordCode) return false;
  return bcrypt.compare(candidateCode, this.resetPasswordCode);
};

export default mongoose.model<IUser>("User", userSchema);
