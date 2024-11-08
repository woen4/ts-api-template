import type { DomainError } from "~/application/types/domain-error";
import type { AsyncEither } from "~/core/logic";

export type IUseCaseResponse<T = Record<string, unknown>> = {
	message: string;
	redirectTo?: string;
} & (T extends Record<string, unknown> ? { detail: T } : {});

export interface IUseCase {
	handle: (
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		payload?: any,
		auth?: unknown,
	) => AsyncEither<DomainError, IUseCaseResponse>;
}
