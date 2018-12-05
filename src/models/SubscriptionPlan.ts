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

  @Column(DataType.SMALLINT)
  booksPerMonth: number;

  @Column(DataType.DECIMAL.UNSIGNED)
  pricePerMonth: number;
}
