import { UserRole } from "../../models/ApplicationUser";
import UserSubscription from "../../models/UserSubscription";

export interface IUserProfile {
  readonly id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  ownedBooks: string[];
  subscription?: UserSubscription;
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
