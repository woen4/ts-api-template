import * as v from "valibot";

export const vSecureString = v.pipe(
	v.string(),
	v.trim(),
	v.minLength(1),
	v.transform((value) =>
		value
			// Remove free accents
			// biome-ignore lint/suspicious/noMisleadingCharacterClass: <explanation>
			.replace(/[\u0300-\u036f]/g, ""),
	),
);
