import type { Context } from "hono";

import type { IUseCase } from "~/application/types/use-case";
import { StatusErrorCodeMapper } from "./status-error-code-mapper";

export const defaultHandler = (useCase: IUseCase) => {
	return async (ctx: Context) => {
		let requestBody: Record<string, unknown>;

		try {
			if (["GET", "DELETE"].includes(ctx.req.method)) {
				requestBody = {};
			} else {
				requestBody = await ctx.req.json();
			}
		} catch {
			return ctx.json({ message: "Corpo de requisição inválido" }, 400);
		}

		const requestPayload = {
			...requestBody,
			...ctx.req.query(),
			...ctx.req.param(),
		};

		const response = await useCase.handle(
			requestPayload,
			ctx.get("jwtPayload"),
		);

		if (response.isLeft())
			return ctx.json(
				response.value,
				StatusErrorCodeMapper(response.value.code),
			);

		const redirectTo = response.value.redirectTo;

		if (redirectTo) {
			const reqUrl = ctx.req.url;
			const reqPath = ctx.req.path;

			const redirectUrl = /^(http|https):\/\//.test(redirectTo)
				? redirectTo
				: reqUrl.replace(reqPath, redirectTo);

			return ctx.redirect(redirectUrl);
		}

		return ctx.json(response.value, 200);
	};
};
