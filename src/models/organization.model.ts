import mongoose, { Document, Schema } from "mongoose";
import { Status } from "../interface/organization.interface";

export interface IOrganization extends Document {
  name: string;
  code: string;
  status: Status;
  createdAt: Date;
  updatedAt: Date;
}

const organizationSchema = new Schema<IOrganization>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 6,
      max_length: 6,
    },
    status: {
      type: String,
      enum: Object.values(Status),
      default: Status.ACTIVE,
    },
  },
  {
    timestamps: true,
  }
);

organizationSchema.index({ code: 1 });
organizationSchema.index({ name: 1 });

export default mongoose.model<IOrganization>(
  "Organization",
  organizationSchema
);
