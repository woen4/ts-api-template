export const mapObject = <T extends object>(
	obj: T,
	fn: (key: keyof T, value: T[keyof T]) => [string, unknown],
) =>
	Object.entries(obj).reduce((output, [clsName, cls]) => {
		const [key, value] = fn(clsName as keyof T, cls);
		return Object.assign(output, { [key]: value });
	}, {});
