import { UserRole } from "../../models/ApplicationUser";

export interface IUserProfile {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface IApplicationUserData {
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: UserRole;
  active?: boolean;
}
