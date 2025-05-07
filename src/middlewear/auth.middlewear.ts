import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UnauthorizedError, ForbiddenError } from "../utils/api-errors";
import User from "../models/user.model";
import Organization from "../models/organization.model";
import { environment } from "../config/environment";
import { AuthRequest } from "../interface/request.interface";
import { IUser, TokenPayload, UserRole } from "../interface/user.interface";

export const authenticateUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("Authentication required");
    }

    const token = authHeader.split(" ")[1];

    const payload = jwt.verify(
      token,
      environment.jwtAccessSecret
    ) as TokenPayload;

    if (payload.role !== UserRole.SUPER_ADMIN && payload.organization) {
      const organization = await Organization.findById(payload.organization);

      if (!organization || organization.status !== "active") {
        throw new UnauthorizedError("Organization not found or inactive");
      }
    }

    const user = await User.findById(payload.userId).select("-password");

    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    req.user = user.toObject() as IUser;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError("Invalid or expired token"));
    } else {
      next(error);
    }
  }
};

export const requireRole = (roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError("Authentication required"));
    }

    if (!roles.includes(req.user.role as UserRole)) {
      return next(
        new ForbiddenError("You don't have permission to access this resource")
      );
    }

    next();
  };
};
