import type { DomainError } from "~/application/types/domain-error";
import type { AsyncEither } from "~/core/logic";

export type IUseCaseResponse<T = void> = {
	message: string;
	redirectTo?: string;
	// biome-ignore lint/complexity/noBannedTypes: required for type flexibility
} & (T extends Record<string, unknown> ? { detail: T } : {});

export interface IUseCase<IUseCaseResponse> {
	handle: (
		// biome-ignore lint/suspicious/noExplicitAny: required for type flexibility
		payload?: any,
		auth?: unknown,
	) => AsyncEither<DomainError, IUseCaseResponse>;
}
