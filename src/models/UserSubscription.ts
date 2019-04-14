import {
  AllowNull,
  AutoIncrement,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table
} from "sequelize-typescript";
import { ISubscriptionCredits } from "../modules/commerce/commerce.contracts";
import ApplicationUser from "./ApplicationUser";
import SubscriptionPlan from "./SubscriptionPlan";

@Table({ tableName: "user_subscription", timestamps: false })
export default class UserSubscription extends Model<UserSubscription> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id: string;

  @Column
  name: string;

  @Column({ field: "subscribed_at", type: DataType.DATE })
  subscribedAt: Date;

  @Column({ field: "expires_at", type: DataType.DATE })
  expiresAt: Date;

  @AllowNull
  @Column({ field: "last_renewed_at", type: DataType.DATE })
  lastRenewedAt: Date | null;

  @Column({ field: "books_per_month", type: DataType.SMALLINT })
  booksPerMonth: number;

  @Column({ field: "price_per_month", type: DataType.DECIMAL.UNSIGNED })
  pricePerMonth: number;

  get isActive(): boolean {
    const expiresAt: Date = this.getDataValue("expiresAt");
    return expiresAt.getTime() > Date.now();
  }

  credits: ISubscriptionCredits;

  /**
   * Foreign key - User
   */
  @BelongsTo(() => ApplicationUser)
  user: ApplicationUser;

  @ForeignKey(() => ApplicationUser)
  @Column({
    field: "user_id",
    type: DataType.BIGINT,
    unique: "user_subscription_plan",
    onDelete: "cascade"
  })
  userId: string;

  /**
   * Foreign key - Subscription Plan
   */
  @BelongsTo(() => SubscriptionPlan)
  plan: SubscriptionPlan;

  @ForeignKey(() => SubscriptionPlan)
  @Column({
    field: "subscription_plan_id",
    type: DataType.BIGINT,
    unique: "user_subscription_plan",
    onDelete: "cascade"
  })
  subscriptionPlanId: string;
}
