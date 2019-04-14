import * as Boom from "boom";
import { Op, WhereOptions } from "sequelize";
import { Model } from "sequelize-typescript";

export interface IPaginatedResource<T> {
  pageCount: number;
  page: number;
  pageSize: number;
  items: T[];
  itemsCount: number;
  total: number;
}

export interface IPaginationQuery<T> {
  page?: number;
  pageSize?: number;
  where?: WhereOptions;
  scope?: string;
  include?: any[];
  sort?: any;
}

export default async function paginate<T extends Model<T>>(
  DBModel: new () => T,
  pagination: IPaginationQuery<T>
) {
  pagination.pageSize = pagination.pageSize || 25;
  pagination.page = pagination.page > 0 ? pagination.page : 1;

  const { pageSize, page, where, scope, include, sort } = pagination;

  const filter = {
    where: where || {},
    limit: pageSize,
    offset: (page - 1) * pageSize,
    include: include || [],
    order: sort || undefined
  };

  // when 'pageSize' is -1, return all records in the database
  if (pageSize < 0) {
    filter.limit = undefined;
    filter.offset = undefined;
  }

  const result = await DBModel[scope ? "scope" : "unscoped"](scope)[
    "findAndCountAll"
  ](filter);

  const pageCount = pageSize > 0 ? Math.ceil(result.count / pageSize) || 1 : 1;
  const items = result.rows as T[];
  const itemsCount = items.length;

  if (itemsCount === 0 && page > 1) {
    throw Boom.badRequest(`Page ${page} has no results to be shown.`);
  }

  return {
    pageCount,
    page,
    pageSize,
    items,
    itemsCount,
    total: result.count
  } as IPaginatedResource<T>;
}

export function searchByColumn<Entity>(
  columnName: keyof Entity,
  value: string = ""
) {
  return {
    [columnName]: {
      [process.env.NODE_ENV === "test" ? Op.like : Op.iLike]: `%${value}%`
    }
  };
}
