import type { PrismaClient } from "@prisma/client";
import type { EmptyObject } from "type-fest";

/** All prisma model names. */
export type ModelName = keyof {
	[Model in keyof PrismaClient as PrismaClient[Model] extends {
		// biome-ignore lint/complexity/noBannedTypes: <explanation>
		findFirstOrThrow: Function;
	}
		? Model
		: never]: boolean;
};

/** For a given model, extract all the available "include" properties and set them all to `true`. */
export type IncludeAll<Model extends ModelName> = NonNullable<
	NonNullable<Parameters<PrismaClient[Model]["findFirstOrThrow"]>[0]>
> extends {
	include?: infer IncludeArg;
}
	? Record<Exclude<keyof NonNullable<IncludeArg>, "_count">, true>
	: EmptyObject;

export type BaseModel<Model extends ModelName> = NonNullable<
	Awaited<ReturnType<PrismaClient[Model]["findFirstOrThrow"]>>
>;

export type JoinedModel<Model extends ModelName> = {
	[FieldName in Extract<keyof IncludeAll<Model>, string>]: Omit<
		ReturnType<PrismaClient[Model]["findFirstOrThrow"]>,
		"then" | "catch" | "finally"
	> extends Record<FieldName, () => Promise<infer Result>>
		? Result
		: `Error: failed to find relation for ${FieldName}`;
};

export type FullModel<Model extends ModelName> = JoinedModel<Model> &
	BaseModel<Model>;

export type ExtendedModel<Model extends ModelName> = Partial<
	JoinedModel<Model>
> &
	BaseModel<Model>;
