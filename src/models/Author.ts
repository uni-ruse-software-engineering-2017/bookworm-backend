import {
  AutoIncrement,
  Column,
  CreatedAt,
  DataType,
  HasMany,
  IsDate,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt
} from "sequelize-typescript";
import Book from "./Book";

@Table({ tableName: "author" })
export default class Author extends Model<Author> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id: string;

  @Column
  name: string;

  @Column(DataType.TEXT)
  biography: string;

  @IsDate
  @Column({ field: "birth_date" })
  birthDate: Date;

  @CreatedAt
  @Column({ field: "created_at" })
  createdAt: Date;

  @UpdatedAt
  @Column({ field: "updated_at" })
  updatedAt: Date;

  @HasMany(() => Book)
  books: Book[];
}
