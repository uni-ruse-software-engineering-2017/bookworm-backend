import { Middleware } from "koa";

export const DEFAULT_PAGE_SIZE = 25;

const withPagination: Middleware = (ctx, next) => {
  const page = Math.abs(parseInt(ctx.query.page)) || 1;
  const pageSize = parseInt(ctx.query.page_size) || 25;
  const sortColumn = ctx.query.sort_by;
  const sortOrder = ctx.query.sort_order;

  ctx.state.pagination = {
    page,
    pageSize
  };

  if (sortColumn) {
    ctx.state.pagination.sortColumn = sortColumn;
  }

  if (sortColumn) {
    ctx.state.pagination.sortOrder = sortOrder;
  }

  return next();
};

export default withPagination;
