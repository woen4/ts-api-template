type TMaybe<T> = T | null | undefined;

type AsyncTMaybe<T> = Promise<TMaybe<T>>;
