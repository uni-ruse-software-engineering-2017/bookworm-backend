import {
  AutoIncrement,
  Column,
  DataType,
  Model,
  PrimaryKey,
  Table
} from "sequelize-typescript";

@Table({ tableName: "subscription_plan" })
export default class SubscriptionPlan extends Model<SubscriptionPlan> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id: string;

  @Column
  name: string;

  @Column({ field: "books_per_month", type: DataType.SMALLINT })
  booksPerMonth: number;

  @Column({ field: "price_per_month", type: DataType.DECIMAL.UNSIGNED })
  pricePerMonth: number;
}
