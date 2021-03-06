import {
  AutoIncrement,
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  Default,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  Unique
} from "sequelize-typescript";
import ApplicationUser from "./ApplicationUser";
import Book from "./Book";
import BookPurchase from "./BookPurchase";

export interface IPurchaseSnapshot {
  author: {
    id: string;
    name: string;
  };
  available: boolean;
  title: string;
  coverImage: string;
  id: string;
  price: string;
  bookId: string;
}

@Table({ tableName: "purchase", timestamps: false })
export default class Purchase extends Model<Purchase> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id: string;

  @Column({ field: "payment_method", type: DataType.STRING })
  paymentMethod: string;

  @Unique
  @Column({ field: "payment_id", type: DataType.STRING })
  paymentId: string;

  @Column({ field: "placed_at", type: DataType.DATE })
  placedAt: Date;

  @Column({ field: "paid_at", type: DataType.DATE })
  paidAt: Date;

  @Default(false)
  @Column({ field: "is_paid", type: DataType.BOOLEAN })
  isPaid: boolean;

  @Column(DataType.JSON)
  snapshot: IPurchaseSnapshot[];

  /**
   * Foreign key - User
   */
  @BelongsTo(() => ApplicationUser)
  user: ApplicationUser;

  @ForeignKey(() => ApplicationUser)
  @Column({ field: "user_id", type: DataType.BIGINT })
  userId: string;

  @BelongsToMany(() => Book, () => BookPurchase)
  books: Book[];
}
