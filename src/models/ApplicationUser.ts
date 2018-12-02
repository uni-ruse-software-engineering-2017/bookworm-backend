import {
  AllowNull,
  AutoIncrement,
  Column,
  CreatedAt,
  DataType,
  Model,
  PrimaryKey,
  Table,
  Unique,
  UpdatedAt
} from "sequelize-typescript";

@Table({ tableName: "application_user" })
export default class ApplicationUser extends Model<ApplicationUser> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id: number;

  @Unique
  @Column
  email: string;

  @Column
  password: string;

  @Column({ field: "first_name", type: DataType.STRING })
  firstName: string;

  @Column({ field: "last_name", type: DataType.STRING })
  lastName: string;

  @Column(DataType.BOOLEAN)
  active: boolean;

  @Column(DataType.ENUM({ values: ["customer", "admin"] }))
  role: "customer" | "admin";

  @AllowNull
  @Column({ field: "password_reset_token", type: DataType.STRING(120) })
  passwordResetToken: string;

  @AllowNull
  @Column({ field: "password_reset_token_expires_at", type: DataType.DATE })
  passwordResetTokenExpiresAt: Date;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
