import type { DomainError } from "~/application/types/domain-error";
import type { RequestContext } from "~/application/types/request-context";
import type { AsyncEither } from "~/core/logic";

export type IUseCaseResponse<T = void> = {
	message: string;
	redirectTo?: string;
} & (T extends Record<string, unknown> ? { detail: T } : Record<never, never>);

export interface IUseCase<TInput, TResponse> {
	handle: (
		payload: TInput,
		ctx: RequestContext,
	) => AsyncEither<DomainError, TResponse>;
}
