export interface IOrganization {
  name: string;
  code: string;
  status: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OrganizationInput {
  name: string;
  code: string;
  status?: boolean;
}
