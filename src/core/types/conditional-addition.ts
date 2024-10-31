type Nullable = undefined | null | false;

type ConditionalAddition<Condition, Prop> = Condition extends Nullable
	? // biome-ignore lint/complexity/noBannedTypes: <explanation>
		{}
	: Prop;
