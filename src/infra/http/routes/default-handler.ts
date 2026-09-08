import type { Context } from "hono";

import {
	type IUseCase,
	type IUseCaseResponse,
	toRequestContext,
} from "~/application/types";
import { matchResult } from "~/core/logic";
import { StatusErrorCodeMapper } from "./status-error-code-mapper";

export const defaultHandler = <
	TInput extends Record<string, unknown>,
	TResponse extends IUseCaseResponse,
>(
	useCase: IUseCase<TInput, TResponse>,
) => {
	return async (ctx: Context) => {
		let requestBody: Record<string, unknown>;

		if (["GET", "DELETE"].includes(ctx.req.method)) {
			requestBody = {};
		} else {
			if (ctx.req.header("Content-Type") === "application/json") {
				requestBody = await ctx.req.json();
			} else {
				requestBody = await ctx.req.parseBody();
			}
		}

		const requestPayload = {
			...requestBody,
			...ctx.req.query(),
			...ctx.req.param(),
		};

		const response = await useCase.handle(
			requestPayload as TInput,
			toRequestContext(ctx.get("jwtPayload")),
		);

		return matchResult(response, {
			fail: (error) => ctx.json(error, StatusErrorCodeMapper(error.code)),
			ok: (data) => {
				const redirectTo = data.redirectTo;

				if (!redirectTo) return ctx.json(data, 200);

				const reqUrl = ctx.req.url;
				const reqPath = ctx.req.path;

				const redirectUrl = /^(http|https):\/\//.test(redirectTo)
					? redirectTo
					: reqUrl.replace(reqPath, redirectTo);

				return ctx.redirect(redirectUrl);
			},
		});
	};
};
