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
import Book from "./Book";
import Purchase, { IPurchaseSnapshot } from "./Purchase";

export interface IBookPurchase {
  readonly id?: string;
  readonly purchaseId: string;
  readonly bookId: string;
  readonly snapshot: IPurchaseSnapshot;
}

@Table({ tableName: "book_purchase", timestamps: false })
export default class BookPurchase extends Model<BookPurchase>
  implements IBookPurchase {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id: string;

  @Column(DataType.JSON)
  snapshot: IPurchaseSnapshot;

  /**
   * Foreign key - Purchase
   */
  @BelongsTo(() => Purchase)
  purchase: Purchase;

  @ForeignKey(() => Purchase)
  @Column({ field: "purchase_id", type: DataType.BIGINT })
  purchaseId: string;

  /**
   * Foreign key - Book
   */
  @BelongsTo(() => Book)
  book: Book;

  @ForeignKey(() => Book)
  @Column({ field: "book_id", type: DataType.BIGINT })
  bookId: string;
}
