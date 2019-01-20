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
import { ICartLine } from "../modules/commerce/commerce.contracts";
import Book from "./Book";
import Purchase from "./Purchase";

export interface IBookPurchase {
  readonly id?: string;
  readonly purchaseId: string;
  readonly bookId: string;
  readonly snapshot: ICartLine;
}

@Table({ tableName: "book_purchase" })
export default class BookPurchase extends Model<BookPurchase>
  implements IBookPurchase {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id: string;

  @Column(DataType.JSON)
  snapshot: ICartLine;

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
