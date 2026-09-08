declare const nonExhaustive: unique symbol;

/**
 * Tipo impossível de satisfazer, usado como `this` de `.exhaustive()` quando
 * ainda restam casos. O erro do compilador aponta exatamente quais membros da
 * união ficaram sem tratamento.
 */
export type NonExhaustive<TRemaining> = {
	readonly [nonExhaustive]: TRemaining;
};

/**
 * Pattern matching exaustivo e tipado.
 *
 * Cada `.with()` remove os padrões tratados da união restante, e `.exhaustive()`
 * só compila quando não resta nenhum caso — adicionar um membro novo à união
 * quebra a compilação até que ele seja tratado.
 *
 * ```ts
 * match(errorCode)
 *   .with(ErrorCodes.NOT_FOUND_ERROR, () => 404)
 *   .with(ErrorCodes.UNAUTHORIZED_ERROR, ErrorCodes.FORBID_ERROR, () => 403)
 *   .exhaustive();
 * ```
 */
class MatchBuilder<TInput, TRemaining, TOutput> {
	private matched = false;
	private output: unknown;

	constructor(private readonly input: TInput) {}

	/** Casa com um ou mais valores exatos e remove-os da união restante. */
	with<const TPatterns extends readonly [TRemaining, ...TRemaining[]], TNext>(
		...args: [
			...patterns: TPatterns,
			handler: (value: TPatterns[number]) => TNext,
		]
	): MatchBuilder<
		TInput,
		Exclude<TRemaining, TPatterns[number]>,
		TOutput | TNext
	>;
	// biome-ignore lint/suspicious/noExplicitAny: assinatura de implementação da sobrecarga
	with(...args: any[]): any {
		const handler = args.at(-1) as (value: unknown) => unknown;
		const patterns = args.slice(0, -1);

		if (!this.matched && patterns.includes(this.input)) {
			this.matched = true;
			this.output = handler(this.input);
		}

		return this;
	}

	/**
	 * Casa por predicado. Com um type predicate (`value is X`) o caso é
	 * descontado da união restante; com um predicado booleano comum não é,
	 * porque o compilador não consegue provar a cobertura.
	 */
	when<TNarrowed extends TRemaining, TNext>(
		predicate: (value: TRemaining) => value is TNarrowed,
		handler: (value: TNarrowed) => TNext,
	): MatchBuilder<TInput, Exclude<TRemaining, TNarrowed>, TOutput | TNext>;
	when<TNext>(
		predicate: (value: TRemaining) => boolean,
		handler: (value: TRemaining) => TNext,
	): MatchBuilder<TInput, TRemaining, TOutput | TNext>;
	// biome-ignore lint/suspicious/noExplicitAny: assinatura de implementação da sobrecarga
	when(predicate: (value: any) => boolean, handler: (value: any) => any): any {
		if (!this.matched && predicate(this.input as never)) {
			this.matched = true;
			this.output = handler(this.input as never);
		}

		return this;
	}

	/** Encerra tratando todos os casos restantes. */
	otherwise<TNext>(handler: (value: TRemaining) => TNext): TOutput | TNext {
		if (!this.matched) {
			this.matched = true;
			this.output = handler(this.input as never);
		}

		return this.output as TOutput | TNext;
	}

	/** Encerra exigindo que a união tenha sido inteiramente coberta. */
	exhaustive(
		this: [TRemaining] extends [never]
			? MatchBuilder<TInput, TRemaining, TOutput>
			: NonExhaustive<TRemaining>,
	): TOutput;
	exhaustive(): TOutput {
		if (!this.matched) {
			throw new Error(
				`match: valor sem correspondência em um match exaustivo: ${String(this.input)}`,
			);
		}

		return this.output as TOutput;
	}
}

export type Match<TInput, TRemaining, TOutput> = MatchBuilder<
	TInput,
	TRemaining,
	TOutput
>;

export const match = <TInput>(input: TInput): Match<TInput, TInput, never> => {
	return new MatchBuilder<TInput, TInput, never>(input);
};
