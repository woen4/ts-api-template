export class Left<L> {
	readonly value: L;

	constructor(value: L) {
		this.value = value;
	}

	isLeft(): this is Left<L> {
		return true;
	}

	isRight(): this is Right<never> {
		return false;
	}
}

export class Right<R> {
	readonly value: R;

	constructor(value: R) {
		this.value = value;
	}

	isLeft(): this is Left<never> {
		return false;
	}

	isRight(): this is Right<R> {
		return true;
	}
}

export type Either<L, R> = Left<L> | Right<R>;

export type AsyncEither<L, R> = Promise<Either<L, R>>;

export const left = <L>(l: L): Either<L, never> => {
	return new Left<L>(l);
};

export const right = <R>(r: R): Either<never, R> => {
	return new Right<R>(r);
};
