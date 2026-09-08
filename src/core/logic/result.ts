/**
 * Resultado destructurável: exatamente um dos dois lados existe.
 *
 * O `?: never` em cada lado é o que faz o narrowing do TypeScript funcionar
 * sobre variáveis desestruturadas — depois de `if (error) return ...`,
 * `data` já é `TData`, sem cast e sem type guard.
 */
export type Ok<TData> = { data: TData; error?: never };

export type Fail<TError> = { data?: never; error: TError };

export type Result<TData, TError> = Ok<TData> | Fail<TError>;

export type AsyncResult<TData, TError> = Promise<Result<TData, TError>>;

/** Extrai o tipo do lado de sucesso de um `Result` (ou `AsyncResult`). */
export type InferData<TResult> =
	Awaited<TResult> extends Result<infer TData, unknown> ? TData : never;

/** Extrai o tipo do lado de erro de um `Result` (ou `AsyncResult`). */
export type InferError<TResult> =
	Awaited<TResult> extends Result<unknown, infer TError> ? TError : never;

export const ok = <TData>(data: TData): Ok<TData> => {
	return { data };
};

export const fail = <TError>(error: TError): Fail<TError> => {
	return { error };
};

export const isOk = <TData, TError>(
	result: Result<TData, TError>,
): result is Ok<TData> => {
	return result.error === undefined;
};

export const isFail = <TData, TError>(
	result: Result<TData, TError>,
): result is Fail<TError> => {
	return result.error !== undefined;
};

type ResultBranches<TData, TError, TOnOk, TOnFail> = {
	ok: (data: TData) => TOnOk;
	fail: (error: TError) => TOnFail;
};

/**
 * Pattern matching sobre um `Result`: os dois lados são obrigatórios, então o
 * compilador garante que nenhum caso ficou sem tratamento.
 *
 * ```ts
 * return matchResult(await useCase.handle(payload, ctx), {
 *   ok: (data) => ctx.json(data, 200),
 *   fail: (error) => ctx.json(error, StatusErrorCodeMapper(error.code)),
 * });
 * ```
 */
export const matchResult = <TData, TError, TOnOk, TOnFail>(
	result: Result<TData, TError>,
	branches: ResultBranches<TData, TError, TOnOk, TOnFail>,
): TOnOk | TOnFail => {
	return isFail(result)
		? branches.fail(result.error)
		: branches.ok(result.data);
};
