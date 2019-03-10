import { UserRole } from "../../models/ApplicationUser";

export interface IUserProfile {
  readonly id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  ownedBooks: string[];
}

export interface IApplicationUserData {
  readonly id?: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: UserRole;
  active?: boolean;
}
