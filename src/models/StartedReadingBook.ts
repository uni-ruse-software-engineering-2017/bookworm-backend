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
import { IBookDetailed } from "../modules/catalog/catalog.contracts";
import ApplicationUser from "./ApplicationUser";
import Book from "./Book";
import UserSubscription from "./UserSubscription";

export interface IStartedReadingBook {
  startedAt: Date;
  id: string;
  userSubscriptionId?: string;
  userSubscription?: UserSubscription;
  bookId: string;
  book: IBookDetailed;
  userId: string;
  user: ApplicationUser;
}

@Table({ tableName: "started_reading_book", timestamps: false })
export default class StartedReadingBook extends Model<StartedReadingBook>
  implements IStartedReadingBook {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id: string;

  @Column({ field: "started_at", type: DataType.DATE })
  startedAt: Date;

  @Column({
    field: "user_subscription_id",
    type: DataType.BIGINT
  })
  userSubscriptionId: string;

  /**
   * Foreign key - User
   */
  @BelongsTo(() => ApplicationUser)
  user: ApplicationUser;

  @ForeignKey(() => ApplicationUser)
  @Column({
    field: "user_id",
    type: DataType.BIGINT,
    unique: "started_reading_book_user",
    onDelete: "cascade"
  })
  userId: string;

  /**
   * Foreign key - Book
   */
  @BelongsTo(() => Book)
  book: Book;

  @ForeignKey(() => Book)
  @Column({
    field: "book_id",
    type: DataType.BIGINT,
    unique: "started_reading_book_user",
    onDelete: "cascade"
  })
  bookId: string;
}
