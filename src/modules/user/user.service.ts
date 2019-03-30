import { badData } from "boom";
import ApplicationUser from "../../models/ApplicationUser";
import Purchase from "../../models/Purchase";
import UserSubscription from "../../models/UserSubscription";
import paginate, { IPaginationQuery } from "../../services/paginate";
import { IApplicationUserData } from "./user.contracts";

class UserService {
  async getById(userId = "") {
    const user = await ApplicationUser.findById(userId, {
      include: [Purchase, UserSubscription]
    });

    return user;
  }

  async getByUsername(username = "") {
    return ApplicationUser.findOne({
      where: {
        email: username
      },
      include: [Purchase, UserSubscription]
    });
  }

  async getAll(pagination: IPaginationQuery<ApplicationUser>) {
    const users = await paginate(ApplicationUser, pagination);

    // remove confidential data
    users.items = users.items.map(u => {
      u.password = null;
      return u;
    });

    return users;
  }

  async create(userData: IApplicationUserData) {
    try {
      const userObj = ApplicationUser.build(userData);
      const createdUser = await userObj.save();
      return createdUser;
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
}

export default new UserService();
