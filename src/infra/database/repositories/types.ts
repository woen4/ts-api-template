import type { db } from "~/prisma/db";

/** The generated ORM namespace holding every model collection. */
type Orm = (typeof db)["orm"]["public"];

/** All prisma model names. */
export type ModelName = keyof Orm;

/**
 * The row shape a model returns, without any eagerly-included relations.
 *
 * Inferred structurally from the `first()` terminal rather than by indexing
 * `Orm[Model]["first"]` — the collection type is overloaded, so a generic index
 * access does not resolve to a callable signature.
 */
export type BaseModel<Model extends ModelName> = Orm[Model] extends {
	first(): Promise<infer Row | null>;
}
	? NonNullable<Row>
	: never;

/**
 * A row that may additionally carry relations pulled in via `include(...)`.
 *
 * Prisma Next (8.0.0-rc.8) does not propagate the related model's row type
 * through `include(...)` — it widens to `{ [x: string]: unknown }`. So relation
 * properties are typed as `unknown` here and must be narrowed by the repository
 * when mapping to a domain entity.
 */
export type ExtendedModel<Model extends ModelName> = BaseModel<Model> & {
	[relation: string]: unknown;
};
