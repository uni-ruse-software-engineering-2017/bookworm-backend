import { badData, badImplementation, isBoom } from "boom";
import * as HttpStatus from "http-status-codes";
import * as koaBody from "koa-body";
import * as Router from "koa-router";
import withRole from "../../middleware/with-role";
import bookService from "./book.service";
import { IBook } from "./catalog.contracts";
import contentService from "./content.service";
import fileService from "./file.service";

const TEN_MB = 10485760;

const BookController = new Router();

BookController.get("/", async ctx => {
  ctx.body = [];
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
      const uploadedFile = await fileService.upload(file, book);

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

export default BookController;
