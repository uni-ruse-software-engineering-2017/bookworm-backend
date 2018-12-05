import {
  AllowNull,
  AutoIncrement,
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  HasMany,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt
} from "sequelize-typescript";

@Table({ tableName: "category" })
export default class Category extends Model<Category> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id: string;

  @Column
  name: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @AllowNull
  @Column({ field: "parent_id", type: DataType.BIGINT })
  parentid: string;

  @BelongsTo(() => Category, "parent_id")
  parent: Category;

  @HasMany(() => Category, "parent_id")
  children: Category[];
}
