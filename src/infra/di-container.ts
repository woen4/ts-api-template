import type { Constructor } from "awilix";
import * as awilix from "awilix";

import * as UsersUseCase from "~/application/use-cases/users";

import { mapObject } from "~/core/logic";
import type { AsInstances } from "~/core/types/as-instances";
import { type Db, db } from "./database";
import * as repositories from "./database/repositories";
import * as providers from "./providers/mail-provider";

type IDiContainer = {
	db: Db;
} & AsInstances<typeof UsersUseCase>;

export const diContainer = awilix.createContainer<IDiContainer>({
	injectionMode: "PROXY",
});

const useCases = {
	...UsersUseCase,
};

for (const cls of Object.values(useCases)) {
	if ("usedAs" in cls) {
		// @ts-expect-error add interdependent use-cases to the container
		useCases[cls.usedAs] = cls;
	}
}

diContainer.register({
	db: awilix.asValue(db),

	...mapObject(useCases, (clsName, cls) => [
		clsName,
		awilix.asClass(cls as Constructor<unknown>).classic(),
	]),

	...mapObject(repositories, (_clsName, cls) => [
		cls.usedAs,
		awilix.asClass(cls as Constructor<unknown>).classic(),
	]),

	...mapObject(providers, (_clsName, cls) => [
		cls.usedAs,
		awilix.asClass(cls as Constructor<unknown>).classic(),
	]),
});
