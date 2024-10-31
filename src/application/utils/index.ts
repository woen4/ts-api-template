import { z } from "zod";

const validCharactersRegex = /^[a-zA-Z0-9\s.,@_-]*$/;

export const zSafeString = (extended: z.ZodString) =>
	z
		.string()
		.refine((val) => validCharactersRegex.test(val), {
			message: "A string contém caracteres inválidos.",
		})
		.and(extended);
