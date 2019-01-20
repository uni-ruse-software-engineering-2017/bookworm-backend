import { notFound } from "boom";
import Purchase from "../../models/Purchase";
import paginate, { IPaginationQuery } from "../../services/paginate";

class PurchaseService {
  async getAll(userId: string, query: IPaginationQuery<Purchase> = {}) {
    return paginate(Purchase, { page: query.page, pageSize: query.pageSize });
  }

  async getById(params: { userId: string; purchaseId: string }) {
    const purchaseRecord = await Purchase.findOne({
      where: {
        id: params.purchaseId,
        userId: params.userId
      }
    });

    if (!purchaseRecord) {
      throw notFound("Purchase not found.");
    }

    return purchaseRecord;
  }
}

export default new PurchaseService();
