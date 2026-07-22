// biome-ignore lint/suspicious/noExplicitAny: utility type needs broad constructor compatibility
export type Class = abstract new (..._args: any[]) => any;

export type AsInstances<T extends Record<string, Class>> = {
	[K in keyof T]: InstanceType<T[K]>;
};
