import { UserRole } from "../../models/ApplicationUser";

export interface IUserProfile {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}
