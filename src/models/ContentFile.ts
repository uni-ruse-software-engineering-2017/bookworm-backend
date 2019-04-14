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

@Table({ tableName: "content_file", timestamps: false })
export default class ContentFile extends Model<ContentFile> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id: string;

  @Column(DataType.STRING(255))
  name: string;

  @Column(DataType.STRING(2048))
  url: string;

  @Column(DataType.STRING(16))
  extension: string;

  @Column({ field: "size_in_bytes", type: DataType.INTEGER })
  sizeInBytes: number;

  @Column({ field: "is_preview", type: DataType.BOOLEAN })
  isPreview: boolean;

  @BelongsTo(() => Book)
  book: Book;

  @ForeignKey(() => Book)
  @Column({ field: "book_id", type: DataType.BIGINT })
  bookId: string;
}
