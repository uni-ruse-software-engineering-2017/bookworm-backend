import {
  AutoIncrement,
  Column,
  DataType,
  Model,
  PrimaryKey,
  Table,
  Unique
} from "sequelize-typescript";
import { ISubscriptionPlan } from "../modules/commerce/commerce.contracts";

@Table({ tableName: "subscription_plan" })
export default class SubscriptionPlan extends Model<SubscriptionPlan>
  implements ISubscriptionPlan {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id: string;

  @Unique
  @Column
  name: string;

  @Column({ field: "books_per_month", type: DataType.SMALLINT })
  booksPerMonth: number;

  @Column({ field: "price_per_month", type: DataType.DECIMAL.UNSIGNED })
  pricePerMonth: number;
}
