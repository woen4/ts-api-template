export type Nullable = undefined | null | false;

export type ConditionalAddition<Condition, Prop> = Condition extends Nullable
	? Record<never, never>
	: Prop;
