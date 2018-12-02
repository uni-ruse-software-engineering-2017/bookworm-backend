import {
  AutoIncrement,
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  Model,
  PrimaryKey,
  Table
} from "sequelize-typescript";
import Book from "./Book";
import Purchase from "./Purchase";

@Table({ tableName: "book_purchase" })
export default class BookPurchase extends Model<BookPurchase> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id: number;

  @Column
  paymentMethod: string;

  @Column({ field: "placed_at", type: DataType.DATE })
  placedAt: Date;

  @Column({ field: "paid_at", type: DataType.DATE })
  paidAt: Date;

  @Default(false)
  @Column({ field: "is_paid", type: DataType.BOOLEAN })
  isPaid: boolean;

  @Column(DataType.JSON)
  snapshot: any;

  /**
   * Foreign key - Purchase
   */
  @BelongsTo(() => Purchase)
  purchase: Purchase;

  @ForeignKey(() => Purchase)
  @Column({ field: "purchase_id", type: DataType.BIGINT })
  purchaseId: number;

  /**
   * Foreign key - Book
   */
  @BelongsTo(() => Book)
  book: Book;

  @ForeignKey(() => Book)
  @Column({ field: "book_id", type: DataType.BIGINT })
  bookId: number;
}
