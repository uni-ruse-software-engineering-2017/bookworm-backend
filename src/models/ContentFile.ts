import {
  AutoIncrement,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  IsUrl,
  Model,
  PrimaryKey,
  Table
} from "sequelize-typescript";
import Book from "./Book";

@Table({ tableName: "content_file" })
export default class ContentFile extends Model<ContentFile> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id: number;

  @Column(DataType.STRING(255))
  name: string;

  @IsUrl
  @Column(DataType.STRING(2048))
  url: string;

  @Column(DataType.STRING(16))
  extension: string;

  @Column({ field: "size_in_bytes", type: DataType.INTEGER })
  sizeInBytes: number;

  @Column(DataType.BOOLEAN)
  isPreview: boolean;

  @BelongsTo(() => Book)
  book: Book;

  @ForeignKey(() => Book)
  @Column(DataType.BIGINT)
  bookId: number;
}
