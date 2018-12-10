import {
  AllowNull,
  AutoIncrement,
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Scopes,
  Table,
  Unique,
  UpdatedAt
} from "sequelize-typescript";

@Scopes({
  full: {
    include: [() => Category]
  }
})
@Table({ tableName: "category" })
export default class Category extends Model<Category> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id: string;

  @Column
  name: string;

  @Unique
  @Column({ field: "seo_url", type: DataType.STRING })
  seoUrl: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @AllowNull
  @ForeignKey(() => Category)
  @Column({ field: "parent_id", type: DataType.BIGINT })
  parentId: string;

  @BelongsTo(() => Category, "parentId")
  parent: Category;

  static async children(categoryId: string) {
    return Category.findAll({
      where: {
        parentId: categoryId
      }
    });
  }
}
