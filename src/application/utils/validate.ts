import type { z } from "zod";
import { ValidationError } from "~/application/errors/validation.error";
import { left } from "~/core/logic";

export function Validate<T extends z.ZodTypeAny>(schema: T) {
	return (
		// biome-ignore lint/complexity/noBannedTypes: <explanation>
		_target: Object,
		_propertyKey: string | symbol,
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		descriptor: TypedPropertyDescriptor<(data: z.infer<T>) => any>,
	) => {
		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		const originalMethod = descriptor.value!;
		descriptor.value = function (data: z.infer<T>) {
			const payload = schema.safeParse(data);
			if (!payload.success) {
				return left(new ValidationError(payload.error));
			}
			return originalMethod.apply(this, [payload.data]);
		};
		return descriptor;
	};
}
