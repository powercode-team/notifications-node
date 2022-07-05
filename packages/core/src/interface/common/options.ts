export interface IOrderBy {
  [key: string]: 'ASC' | 'DESC' | 'asc' | 'desc' | 1 | -1;
}

export interface IOptions {
  order?: IOrderBy;
  offset?: number;
  limit?: number;
}
