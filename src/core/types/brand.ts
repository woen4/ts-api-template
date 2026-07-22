export type Brand<T, TName extends string> = T & {
	readonly __brand: TName;
};
