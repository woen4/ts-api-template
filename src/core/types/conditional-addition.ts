type Nullable = undefined | null | false;

type ConditionalAddition<Condition, Prop> = Condition extends Nullable
	? Record<string, string>
	: Prop;
