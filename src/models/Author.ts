import {
  AutoIncrement,
  Column,
  CreatedAt,
  DataType,
  HasMany,
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

  @Column({ field: "birth_date" })
  birthDate: Date;

  @CreatedAt
  creationDate: Date;

  @UpdatedAt
  updatedOn: Date;

  @HasMany(() => Book)
  books: Book[];
}
