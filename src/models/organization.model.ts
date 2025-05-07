import mongoose, { Document, Schema } from "mongoose";

export interface IOrganization extends Document {
  name: string;
  code: string;
  status: string;
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
      enum: ["active", "inactive", "pending"],
      default: "active",
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
