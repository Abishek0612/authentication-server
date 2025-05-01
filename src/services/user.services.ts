// src/services/user.services.ts
import User from "../models/user.model";
import { NotFoundError } from "../utils/api-errors";

export default class UserService {
  /**
   * Get user by ID
   */
  static async getUserById(userId: string) {
    const user = await User.findById(userId).select("-password");
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return user;
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(
    userId: string,
    updateData: { name?: string }
  ) {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return user;
  }
}
