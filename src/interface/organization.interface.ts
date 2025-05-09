export enum Status {
  ACTIVE = "active",
  INACTIVE = "inactive",
  DELETE = "delete",
}

export interface IOrganization {
  name: string;
  code: string;
  status: Status;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OrganizationInput {
  name: string;
  code: string;
  status?: Status;
}
