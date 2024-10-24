type NullAsUndefined<T> = {
	[P in keyof T]: T[P] extends NonNullable<T[P]> // if T[P] exists, if is not null or undefined
		? T[P]
		: T[P] extends infer U | null
			? U | undefined
			: T[P];
};
