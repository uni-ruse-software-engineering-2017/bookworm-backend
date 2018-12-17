import { Middleware } from "koa";

export const DEFAULT_PAGE_SIZE = 25;

const withPagination: Middleware = (ctx, next) => {
  const page = Math.abs(parseInt(ctx.query.page)) || 1;
  const pageSize = Math.abs(parseInt(ctx.query.page_size)) || 25;

  ctx.state.pagination = {
    page,
    pageSize
  };

  return next();
};

export default withPagination;
