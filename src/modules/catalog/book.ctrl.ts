import { badData, badImplementation, isBoom } from "boom";
import * as HttpStatus from "http-status-codes";
import * as koaBody from "koa-body";
import * as Router from "koa-router";
import withPagination from "../../middleware/with-pagination";
import withRole from "../../middleware/with-role";
import Book from "../../models/Book";
import { IPaginationQuery, searchByColumn } from "../../services/paginate";
import bookService from "./book.service";
import { IBook } from "./catalog.contracts";
import contentService from "./content.service";
import fileService from "./file.service";

const TEN_MB = 10485760;

const BookController = new Router();

BookController.get("/", withPagination, async ctx => {
  if (ctx.query["category_id"]) {
    ctx.body = await bookService.getAllByCategoryId(
      ctx.query["category_id"] as string,
      ctx.state.pagination
    );
  } else {
    const query: IPaginationQuery<Book> = ctx.query["q"]
      ? {
          ...ctx.state.pagination,
          where: searchByColumn<Book>("title", ctx.query["q"])
        }
      : ctx.state.pagination;
    ctx.body = await bookService.getAll(query);
  }

  return ctx;
});

BookController.get("/:id", async ctx => {
  const book = await bookService.getById(ctx.params.id);

  ctx.body = book;
  return ctx;
});

BookController.post("/", withRole("admin"), async ctx => {
  const bookData = ctx.request.body as IBook;
  const bookCreated = await bookService.create(bookData);

  ctx.body = bookCreated;
  ctx.status = HttpStatus.CREATED;
  return ctx;
});

BookController.patch("/:id", withRole("admin"), async ctx => {
  const bookData = ctx.request.body as Partial<IBook>;
  const updatedBook = await bookService.edit(ctx.params.id, bookData);

  ctx.body = updatedBook;
  return ctx;
});

BookController.delete("/:id", withRole("admin"), async ctx => {
  const removedBook = await bookService.remove(ctx.params.id);

  ctx.status = HttpStatus.OK;
  ctx.body = removedBook;
  return ctx;
});

BookController.get("/:id/files", async ctx => {
  const contentFiles = await contentService.getAllByBookId(ctx.params.id);

  ctx.body = contentFiles;
  return ctx;
});

BookController.post(
  "/:id/files",
  withRole("admin"),
  koaBody({ multipart: true, formidable: { maxFileSize: TEN_MB } }),
  async (ctx, next) => {
    const book = await bookService.getById(ctx.params.id);

    const file = ctx.request.files.file;

    try {
      const uploadedFile = await fileService.upload(file, book as IBook);

      const content = await contentService
        .create({
          bookId: book.id,
          name: uploadedFile.name,
          extension: fileService.getExtension(uploadedFile.name),
          isPreview: false,
          sizeInBytes: uploadedFile.size,
          url: uploadedFile.path
        })
        .catch(error => {
          throw badData("Failed validation", error);
        });

      ctx.body = content;
      return ctx;
    } catch (error) {
      if (isBoom(error)) {
        throw error;
      } else {
        throw badImplementation("Upload failed.", error);
      }
    }
  }
);

BookController.delete(
  "/:id/files/:fileId",
  withRole("admin"),
  async (ctx, next) => {
    await bookService.getById(ctx.params.id);

    const fileId: string = ctx.params.fileId;

    try {
      const content = await contentService.getById(fileId);

      // delete it from the file system
      await fileService.delete(content.url);

      // then delete it from the database
      content.destroy();

      ctx.body = content.toJSON();
      return ctx;
    } catch (error) {
      if (isBoom(error)) {
        throw error;
      } else {
        throw badImplementation("File delete failed.", error);
      }
    }
  }
);

export default BookController;
