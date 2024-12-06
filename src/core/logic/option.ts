export class Option<T> {
	private constructor(private readonly value: T | null | undefined) {}

	// Cria uma instância de Option encapsulando o valor fornecido
	public static of<U>(value: U | null | undefined): Option<U> {
		return new Option(value);
	}

	// Verifica se o valor é "nada" (null ou undefined)
	public isNothing(): boolean {
		return this.value === null || this.value === undefined;
	}

	// Aplica uma função ao valor encapsulado, se existir
	public map<U>(fn: (value: T) => U): Option<U> {
		return this.isNothing()
			? Option.of<U>(null)
			: Option.of(fn(this.value as T));
	}

	// Encadeia uma função que retorna outro Option
	public chain<U>(fn: (value: T) => U): Option<U> {
		return this.isNothing()
			? Option.of<U>(null)
			: Option.of(fn(this.value as T));
	}

	// Retorna o valor ou um valor padrão, caso seja "nada"
	public getOrElse(defaultValue: T): T {
		return this.isNothing() ? defaultValue : (this.value as T);
	}

	// Aplica uma função que retorna um valor ao encapsulado ou um valor padrão
	public fold<U>(fn: (value: T) => U, defaultValue: U): U {
		return this.isNothing() ? defaultValue : fn(this.value as T);
	}

	// Retorna o valor encapsulado (pode ser null ou undefined)
	public get(): T | null | undefined {
		return this.value;
	}
}
