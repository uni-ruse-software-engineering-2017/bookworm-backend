import { badData, notFound } from "boom";
import ContentFile from "../../models/ContentFile";
import { IContentFileMetadata } from "./catalog.contracts";

class ContentService {
  async getAllByBookId(bookId: string, hasAccess: boolean) {
    const scope = hasAccess ? "full" : "restricted";

    return ContentFile.scope(scope).findAll({
      where: {
        bookId: bookId
      }
    });
  }

  async create(contentFileMetadata: IContentFileMetadata) {
    try {
      const bookContent = await ContentFile.create(contentFileMetadata);
      return bookContent;
    } catch (error) {
      throw badData("Validation failed.", error.errors || error);
    }
  }

  async getById(contentId: string) {
    const bookContent = await ContentFile.findByPk(contentId);

    if (!bookContent) {
      throw notFound(`Content file with ID ${contentId} not found.`);
    }

    return bookContent;
  }

  async update(contentId: string, data: Partial<IContentFileMetadata>) {
    const bookContent = await this.getById(contentId);

    if (data.name) {
      bookContent.name = data.name;
    }

    if (typeof data.isPreview !== "undefined") {
      bookContent.isPreview = data.isPreview;
    }

    if (data.url) {
      bookContent.url = data.url;
    }

    try {
      const updatedRecord = await bookContent.save();
      return updatedRecord;
    } catch (error) {
      throw badData("Validation failed.", error.errors || error);
    }
    return bookContent as IContentFileMetadata;
  }
}

export default new ContentService();
