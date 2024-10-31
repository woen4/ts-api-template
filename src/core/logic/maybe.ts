export class Maybe<T> {
	private constructor(private readonly value: T | null | undefined) {}

	// Cria uma instância de Maybe encapsulando o valor fornecido
	public static of<U>(value: U | null | undefined): Maybe<U> {
		return new Maybe(value);
	}

	// Verifica se o valor é "nada" (null ou undefined)
	public isNothing(): boolean {
		return this.value === null || this.value === undefined;
	}

	// Aplica uma função ao valor encapsulado, se existir
	public map<U>(fn: (value: T) => U): Maybe<U> {
		return this.isNothing() ? Maybe.of<U>(null) : Maybe.of(fn(this.value as T));
	}

	// Encadeia uma função que retorna outro Maybe
	public chain<U>(fn: (value: T) => U): Maybe<U> {
		return this.isNothing() ? Maybe.of<U>(null) : Maybe.of(fn(this.value as T));
	}

	// Retorna o valor ou um valor padrão, caso seja "nada"
	public getOrElse(defaultValue: T): T {
		return this.isNothing() ? defaultValue : (this.value as T);
	}

	// Aplica uma função que retorna um valor ao encapsulado ou um valor padrão
	public fold<U>(defaultValue: U, fn: (value: T) => U): U {
		return this.isNothing() ? defaultValue : fn(this.value as T);
	}

	// Retorna o valor encapsulado (pode ser null ou undefined)
	public get(): T | null | undefined {
		return this.value;
	}
}
