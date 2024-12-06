export type Nullable = undefined | null | false;

export type ConditionalAddition<Condition, Prop> = Condition extends Nullable
	? // biome-ignore lint/complexity/noBannedTypes: <explanation>
		{}
	: Prop;
