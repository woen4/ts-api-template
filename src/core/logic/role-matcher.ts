export class RoleMatcher<T, R> {
	private role: T;
	private matches: Array<{ condition: T; action: () => Promise<R> | R }> = [];

	constructor(role: T) {
		this.role = role;
	}

	match(condition: T, action: (() => Promise<R>) | R): this {
		this.matches.push({
			condition,
			action: (typeof action === "function" ? action : () => action) as () => R,
		});
		return this;
	}

	async evaluate(): Promise<R | undefined> {
		const matched = this.matches.find((m) => m.condition === this.role);
		return matched ? matched.action() : undefined;
	}
}
