// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type Class = abstract new (..._args: any[]) => any;

type AsInstances<T extends Record<string, Class>> = {
	[K in keyof T]: InstanceType<T[K]>;
};
