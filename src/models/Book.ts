import {
  AllowNull,
  AutoIncrement,
  BelongsTo,
  BelongsToMany,
  Column,
  CreatedAt,
  DataType,
  Default,
  ForeignKey,
  HasMany,
  Is,
  IsDate,
  IsNumeric,
  IsUrl,
  Length,
  Model,
  PrimaryKey,
  Scopes,
  Table,
  Unique,
  UpdatedAt
} from "sequelize-typescript";
import { ISBNValidator } from "../util/validators";
import Author from "./Author";
import BookPurchase from "./BookPurchase";
import Category from "./Category";
import Comment from "./Comment";
import Purchase from "./Purchase";

@Scopes({
  detailed: {
    include: [() => Author.scope("listItem"), () => Category]
  },
  listItem: {
    include: [() => Author.scope("listItem"), () => Category],
    attributes: ["id", "title", "price", "coverImage", "featured", "available"]
  }
})
@Table({ tableName: "book" })
export default class Book extends Model<Book> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id: string;

  @Unique
  @AllowNull(false)
  @Length({ min: 1 })
  @Column
  title: string;

  @Unique
  @Is(ISBNValidator)
  @Column({ type: DataType.STRING })
  get isbn(): string {
    return this.getDataValue("isbn");
  }

  set isbn(value: string) {
    value = value || "";
    value = value.replace(/[\s\-]+/g, "");
    this.setDataValue("isbn", value);
  }

  @AllowNull(false)
  @IsNumeric
  @Column(DataType.SMALLINT)
  pages: number;

  @IsDate
  @Column({ field: "date_published", type: DataType.DATEONLY })
  datePublished: Date;

  @AllowNull
  @Column(DataType.TEXT)
  summary: string;

  @Default(0.0)
  @Column(DataType.DECIMAL.UNSIGNED)
  price: number;

  @IsUrl
  @AllowNull
  @Column({ field: "cover_image", type: DataType.STRING(2048) })
  coverImage: string;

  @Default(false)
  @Column({ field: "free_download", type: DataType.BOOLEAN })
  freeDownload: boolean;

  @Default(true)
  @Column(DataType.BOOLEAN)
  available: boolean;

  @Default(false)
  @Column(DataType.BOOLEAN)
  featured: boolean;

  @CreatedAt
  @Column({ field: "created_at" })
  createdAt: Date;

  @UpdatedAt
  @Column({ field: "updated_at" })
  updatedAt: Date;

  /**
   * Foreign key - Author
   */
  @BelongsTo(() => Author)
  author: Author;

  @AllowNull(false)
  @ForeignKey(() => Author)
  @Column({ field: "author_id", type: DataType.BIGINT })
  authorId: string;

  /**
   * Foreign key - Category
   */
  @BelongsTo(() => Category)
  category: Category;

  @AllowNull(false)
  @ForeignKey(() => Category)
  @Column({ field: "category_id", type: DataType.BIGINT })
  categoryId: string;

  @HasMany(() => Comment)
  comments: Comment[];

  @BelongsToMany(() => Purchase, () => BookPurchase)
  purchases: Purchase[];
}
