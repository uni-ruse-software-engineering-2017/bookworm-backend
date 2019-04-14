import {
  AutoIncrement,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table
} from "sequelize-typescript";
import ApplicationUser from "./ApplicationUser";
import Book from "./Book";

@Table({ tableName: "shopping_cart", timestamps: false })
export default class ShoppingCart extends Model<ShoppingCart> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id: string;

  /**
   * Foreign key - User
   */
  @BelongsTo(() => ApplicationUser)
  user: ApplicationUser;

  @ForeignKey(() => ApplicationUser)
  @Column({
    field: "user_id",
    type: DataType.BIGINT,
    unique: "shopping_cart_book_user",
    onDelete: "cascade"
  })
  userId: string;

  @BelongsTo(() => Book)
  book: Book;

  @ForeignKey(() => Book)
  @Column({
    field: "book_id",
    type: DataType.BIGINT,
    unique: "shopping_cart_book_user",
    onDelete: "cascade"
  })
  bookId: string;
}
