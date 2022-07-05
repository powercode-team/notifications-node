/** Make all properties optional & some properties as required */
export type PartialRequired<T, K extends keyof T> = Partial<Exclude<T, K>> & Required<Pick<T, K>>;

/** Make some properties as partial */
export type PartialProps<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/** Make some properties as required */
export type RequiredProps<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;
