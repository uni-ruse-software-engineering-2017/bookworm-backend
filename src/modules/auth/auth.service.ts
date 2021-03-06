import { badData, unauthorized } from "boom";
import ApplicationUser from "../../models/ApplicationUser";
import { sessionService } from "../../services/session";
import { IApplicationUserData } from "../user/user.contracts";
import userService from "../user/user.service";
import { ILoginCredentials, ISignUpData } from "./auth.contracts";

class AuthService {
  async signUp(userData: ISignUpData) {
    if (!userData.password) {
      throw badData("Password is required.");
    }

    if (!userData.email) {
      throw badData("Email address is required.");
    }

    try {
      const userObj = ApplicationUser.build({
        ...userData,
        role: "customer",
        active: false
      } as IApplicationUserData);

      await userObj.save();
    } catch (error) {
      if (error.name === "SequelizeUniqueConstraintError") {
        throw badData(
          `User with email ${userData.email} has already been registered.`
        );
      } else if (error.name === "SequelizeValidationError") {
        throw badData("Failed validation.", error.errors);
      } else {
        throw error;
      }
    }
  }

  async login(loginData: ILoginCredentials) {
    if (!loginData.password || !loginData.email) {
      throw badData("You must provide email address and password.");
    }

    const user = await userService.getByUsername(loginData.email);

    if (!user) {
      throw unauthorized("Invalid credentials.");
    }

    const isAuthenticated = await user.comparePasswords(loginData.password);

    if (!isAuthenticated) {
      throw unauthorized("Invalid credentials.");
    }

    const userData = user.toJSON() as IApplicationUserData;
    const userSession = await sessionService.create(userData);

    return userSession;
  }

  async logout(sessionId: string) {
    await sessionService.delete(sessionId);
  }
}

export default new AuthService();
