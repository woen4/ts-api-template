import type { DomainError } from "~/application/types/domain-error";
import type { AsyncEither } from "~/core/logic";

export type IUseCaseResponse<T = unknown> = {
	message: string;
	redirectTo?: string;
	// biome-ignore lint/complexity/noBannedTypes: <explanation>
} & (T extends Object ? { detail: T } : unknown);

export interface IUseCase {
	handle: (
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		payload?: any,
		auth?: unknown,
	) => AsyncEither<DomainError, IUseCaseResponse>;
}
