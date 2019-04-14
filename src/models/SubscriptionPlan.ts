import {
  AllowNull,
  AutoIncrement,
  Column,
  DataType,
  Is,
  Model,
  PrimaryKey,
  Table,
  Unique
} from "sequelize-typescript";
import { ISubscriptionPlan } from "../modules/commerce/commerce.contracts";
import { PositiveNumberValidator } from "./../util/validators";

@Table({ tableName: "subscription_plan", timestamps: false })
export default class SubscriptionPlan extends Model<SubscriptionPlan>
  implements ISubscriptionPlan {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id: string;

  @Unique
  @Column
  name: string;

  @AllowNull(false)
  @Is(PositiveNumberValidator)
  @Column({ field: "books_per_month", type: DataType.SMALLINT })
  booksPerMonth: number;

  @AllowNull(false)
  @Is(PositiveNumberValidator)
  @Column({ field: "price_per_month", type: DataType.DECIMAL.UNSIGNED })
  pricePerMonth: number;
}
