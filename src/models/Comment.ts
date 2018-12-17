import {
  AutoIncrement,
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt
} from "sequelize-typescript";
import ApplicationUser from "./ApplicationUser";
import Book from "./Book";

@Table({ tableName: "comment" })
export default class Comment extends Model<Comment> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id: string;

  @Column(DataType.TEXT)
  content: string;

  @CreatedAt
  @Column({ field: "created_at" })
  createdAt: Date;

  @UpdatedAt
  @Column({ field: "updated_at" })
  updatedAt: Date;

  /**
   * Foreign key - Book
   */
  @BelongsTo(() => Book)
  book: Book;

  @ForeignKey(() => Book)
  @Column({ field: "book_id", type: DataType.BIGINT })
  bookId: string;

  /**
   * Foreign key - User
   */
  @BelongsTo(() => ApplicationUser)
  user: ApplicationUser;

  @ForeignKey(() => ApplicationUser)
  @Column({ field: "user_id", type: DataType.BIGINT })
  userId: string;
}
