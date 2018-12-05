import { WhereOptions } from "sequelize";
import { Model } from "sequelize-typescript";

export interface IPaginationQuery<T> {
  page?: number;
  pageSize?: number;
  where?: WhereOptions<T>;
}

export default async function paginate<T extends Model<T>>(
  DBModel: new () => T,
  pagination: IPaginationQuery<T>
) {
  pagination.pageSize = pagination.pageSize > 0 ? pagination.pageSize : 25;
  pagination.page = pagination.page > 0 ? pagination.page : 1;

  const { pageSize, page, where } = pagination;
  const result = await DBModel["findAndCountAll"]({
    where: where || {},
    limit: pageSize,
    offset: (page - 1) * pageSize
  });

  const pageCount = Math.ceil(result.count / pageSize) || 1;
  const items = result.rows as T[];

  return {
    pageCount,
    page,
    pageSize,
    items,
    total: result.count
  };
}
