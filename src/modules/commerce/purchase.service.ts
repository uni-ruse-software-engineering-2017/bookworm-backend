import { notFound } from "boom";
import Purchase from "../../models/Purchase";
import paginate, { IPaginationQuery } from "../../services/paginate";

class PurchaseService {
  async getAll(query: IPaginationQuery<Purchase> = {}) {
    return paginate(Purchase, { page: query.page, pageSize: query.pageSize });
  }

  async getAllForUser(userId: string, query: IPaginationQuery<Purchase> = {}) {
    return paginate(Purchase, {
      page: query.page,
      pageSize: query.pageSize,
      where: { userId }
    });
  }

  async getById(params: { userId?: string; purchaseId: string }) {
    const whereClause = {
      id: params.purchaseId
    };

    if (params.userId) {
      whereClause["userId"] = params.userId;
    }

    const purchaseRecord = await Purchase.findOne({
      where: whereClause
    });

    if (!purchaseRecord) {
      throw notFound("Purchase not found.");
    }

    return purchaseRecord;
  }
}

export default new PurchaseService();
