import { Accessor } from 'solid-js';

export type Pagination = {
  limit: number;
  offset: number;
};

export const createPagination = (
  limit: Accessor<number>,
  page: Accessor<number>,
): Accessor<Pagination> => () => ({
  limit: limit(),
  offset: page() * limit(),
});

export const getSearchParams = (pagination: Pagination, urlParams?: URLSearchParams): URLSearchParams => {
  const params = new URLSearchParams(urlParams);

  params.set('limit', pagination.limit.toString());
  params.set('offset', pagination.offset.toString());


  return params;
};
