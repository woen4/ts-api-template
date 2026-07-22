import type { z } from "zod";
import { ValidationError } from "~/application/errors/validation.error";
import { left } from "~/core/logic";

export function Validate<T extends z.ZodTypeAny>(schema: T) {
	return <TRest extends unknown[], TReturn>(
		_target: object,
		_propertyKey: string | symbol,
		descriptor: TypedPropertyDescriptor<
			(data: z.infer<T>, ...rest: TRest) => TReturn
		>,
	) => {
		const originalMethod = descriptor.value;
		if (!originalMethod) {
			return descriptor;
		}

		descriptor.value = function (
			this: unknown,
			data: z.infer<T>,
			...rest: TRest
		) {
			const payload = schema.safeParse(data);
			if (!payload.success) {
				return left(new ValidationError(payload.error)) as TReturn;
			}
			return originalMethod.apply(this, [payload.data, ...rest]);
		} as (data: z.infer<T>, ...rest: TRest) => TReturn;
		return descriptor;
	};
}
