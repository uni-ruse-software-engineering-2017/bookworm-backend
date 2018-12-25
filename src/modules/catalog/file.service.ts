import { File } from "formidable";
import { createReadStream, createWriteStream, ensureDir } from "fs-extra";
import { join } from "path";
import slugify from "slugify";
import { rootPath } from "../../root-path";
import { IBook, IUploadedFileMetadata } from "./catalog.contracts";

const uploadsDir = join(rootPath, "/uploads");

class FileService {
  async upload(file: File, book: IBook) {
    const fileName = slugify(file.name);
    const folderName = `${book.id}-_-${slugify(book.title)}`;
    const destinationFolder = join(uploadsDir, folderName);

    await ensureDir(destinationFolder);

    const filePath = join(destinationFolder, fileName);
    const reader = createReadStream(file.path);
    const stream = createWriteStream(filePath);
    reader.pipe(stream);

    return new Promise<IUploadedFileMetadata>((resolve, reject) => {
      reader.on("end", () => {
        const uploadedFileMetadata: IUploadedFileMetadata = {
          name: file.name,
          path: join(folderName, fileName),
          size: file.size,
          type: file.type,
          lastModifiedDate: file.lastModifiedDate
        };

        return resolve(uploadedFileMetadata);
      });

      reader.on("error", error => {
        return reject(error);
      });
    });
  }

  getExtension(fileName: string = "") {
    const indexOfLastDot = fileName.lastIndexOf(".");

    if (indexOfLastDot === -1) {
      return "";
    }

    return fileName.substring(indexOfLastDot + 1, fileName.length);
  }
}

export default new FileService();
