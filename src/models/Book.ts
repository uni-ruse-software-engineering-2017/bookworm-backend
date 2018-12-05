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
  IsUrl,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt
} from "sequelize-typescript";
import Author from "./Author";
import BookPurchase from "./BookPurchase";
import Category from "./Category";
import Comment from "./Comment";
import Purchase from "./Purchase";

@Table({ tableName: "book" })
export default class Book extends Model<Book> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id: string;

  @Column
  title: string;

  @Column(DataType.SMALLINT)
  pages: number;

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
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  /**
   * Foreign key - Author
   */
  @BelongsTo(() => Author)
  author: Author;

  @ForeignKey(() => Author)
  @Column({ field: "author_id", type: DataType.BIGINT })
  authorid: string;

  /**
   * Foreign key - Category
   */
  @BelongsTo(() => Category)
  category: Category;

  @ForeignKey(() => Category)
  @Column({ field: "category_id", type: DataType.BIGINT })
  categoryid: string;

  @HasMany(() => Comment)
  comments: Comment[];

  @BelongsToMany(() => Purchase, () => BookPurchase)
  purchases: Purchase[];
}
