// biome-ignore lint/suspicious/noExplicitAny: required for type flexibility
export type Class = abstract new (..._args: any[]) => any;

export type AsInstances<T extends Record<string, Class>> = {
	[K in keyof T]: InstanceType<T[K]>;
};
