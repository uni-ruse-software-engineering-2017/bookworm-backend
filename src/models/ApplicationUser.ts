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
  HasOne,
  IsEmail,
  Length,
  Model,
  PrimaryKey,
  Table,
  Unique,
  UpdatedAt
} from "sequelize-typescript";
import Purchase, { IPurchaseSnapshot } from "./Purchase";
import StartedReadingBook from "./StartedReadingBook";
import UserSubscription from "./UserSubscription";

const MIN_PASSWORD_LENGTH = 8;

export type UserRole = "customer" | "admin";

@Table({ tableName: "application_user" })
export default class ApplicationUser extends Model<ApplicationUser> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id: string;

  @Unique
  @AllowNull(false)
  @IsEmail
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

  @HasMany(() => StartedReadingBook)
  startedReading: StartedReadingBook[];

  @HasOne(() => UserSubscription)
  subscription: UserSubscription;

  async comparePasswords(candidatePassword: string = "") {
    return bcrypt.compare(candidatePassword, this.password);
  }

  get purchasedBooks() {
    const purchases: Purchase[] = this.get("purchases") || [];

    const bookIds = new Set(
      purchases
        .reduce((prev, curr) => {
          return prev.concat(curr.snapshot || []);
        }, [])
        .map((snapshot: IPurchaseSnapshot) => {
          return snapshot.bookId;
        })
    );

    return bookIds;
  }

  get booksStartedReading() {
    const started: StartedReadingBook[] = this.get("startedReading") || [];

    return new Set(started.map(started => started.bookId));
  }

  @BeforeSave
  static async hashPassword(instance: ApplicationUser) {
    const hashed = await bcrypt.hash(instance.password, 10);
    instance.password = hashed;
  }
}
