class MatcherCls<T, R> {
	private condition: T;
	private matches: Array<{ condition: T; action: () => Promise<R> | R }> = [];

	constructor(condition: T) {
		this.condition = condition;
	}

	match(condition: T, action: (() => Promise<R>) | R): this {
		this.matches.push({
			condition,
			action: (typeof action === "function" ? action : () => action) as () => R,
		});
		return this;
	}

	async evaluate(): Promise<R | undefined> {
		const matched = this.matches.find((m) => m.condition === this.condition);
		return matched ? matched.action() : undefined;
	}
}

export const Matcher = <T, R>(condition: T) => new MatcherCls<T, R>(condition);
