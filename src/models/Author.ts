import {
  AllowNull,
  AutoIncrement,
  Column,
  CreatedAt,
  DataType,
  HasMany,
  IsDate,
  Model,
  PrimaryKey,
  Scopes,
  Table,
  Unique,
  UpdatedAt
} from "sequelize-typescript";
import Book from "./Book";

@Scopes({
  detailed: {
    include: [
      {
        model: () => Book,
        as: "books",
        attributes: ["id", "title", "price", "coverImage", "available"]
      }
    ]
  },
  listItem: {
    attributes: ["id", "name", "bornAt"]
  }
})
@Table({ tableName: "author" })
export default class Author extends Model<Author> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id: string;

  @Unique
  @Column
  name: string;

  @Column(DataType.TEXT)
  biography: string;

  @AllowNull
  @Column({ field: "image_url", type: DataType.STRING })
  imageUrl: string;

  @IsDate
  @Column({ field: "born_at", type: DataType.DATE })
  bornAt: Date;

  @AllowNull
  @IsDate
  @Column({ field: "died_at", type: DataType.DATE })
  diedAt: Date;

  @CreatedAt
  @Column({ field: "created_at" })
  createdAt: Date;

  @UpdatedAt
  @Column({ field: "updated_at" })
  updatedAt: Date;

  @HasMany(() => Book)
  books: Book[];
}
