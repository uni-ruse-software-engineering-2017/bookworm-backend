import * as bcrypt from "bcrypt";
import {
  AllowNull,
  AutoIncrement,
  BeforeSave,
  Column,
  CreatedAt,
  DataType,
  Default,
  HasMany,
  Length,
  Model,
  PrimaryKey,
  Table,
  Unique,
  UpdatedAt
} from "sequelize-typescript";
import Book from "./Book";
import Purchase from "./Purchase";

const MIN_PASSWORD_LENGTH = 8;

export type UserRole = "customer" | "admin";

@Table({ tableName: "application_user" })
export default class ApplicationUser extends Model<ApplicationUser> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id: string;

  @Unique
  @Column
  email: string;

  @Length({ min: MIN_PASSWORD_LENGTH })
  @Column
  password: string;

  @Column({ field: "first_name", type: DataType.STRING })
  firstName: string;

  @Column({ field: "last_name", type: DataType.STRING })
  lastName: string;

  @Default(false)
  @Column(DataType.BOOLEAN)
  active: boolean;

  @Default("customer")
  @Column(DataType.ENUM({ values: ["customer", "admin"] }))
  role: UserRole;

  @AllowNull
  @Column({ field: "password_reset_token", type: DataType.STRING(120) })
  passwordResetToken: string;

  @AllowNull
  @Column({ field: "password_reset_token_expires_at", type: DataType.DATE })
  passwordResetTokenExpiresAt: Date;

  @CreatedAt
  @Column({ field: "created_at" })
  createdAt: Date;

  @UpdatedAt
  @Column({ field: "updated_at" })
  updatedAt: Date;

  @HasMany(() => Purchase)
  purchases: Purchase[];

  async comparePasswords(candidatePassword: string = "") {
    return bcrypt.compare(candidatePassword, this.password);
  }

  async getPurchasedBooks() {
    const purchases: Purchase[] = this.get("purchases");

    const bookIds = new Set(
      purchases
        .reduce((prev, curr) => {
          return prev.concat(curr.snapshot || []);
        }, [])
        .map((book: Book) => book.id)
    );

    return bookIds;
  }

  @BeforeSave
  static async hashPassword(instance: ApplicationUser) {
    const hashed = await bcrypt.hash(instance.password, 10);
    instance.password = hashed;
  }
}
