import { Request } from "express";
import { Document } from "mongoose";
import { IUser } from "../models/user.model";

export interface AuthRequest extends Request {
  user?: Document<unknown, any, IUser> & IUser;
}
