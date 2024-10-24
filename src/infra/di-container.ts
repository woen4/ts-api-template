import type { PrismaClient } from "@prisma/client";
import type { Constructor } from "awilix";
import * as awilix from "awilix";

import * as UsersUseCase from "~/application/use-cases/users";

import { mapObject } from "~/core/logic";
import { prismaClient } from "./database";
import * as repositories from "./database/repositories";

type IDiContainer = {
	prisma: PrismaClient;
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
	prisma: awilix.asValue(prismaClient),

	...mapObject(useCases, (clsName, cls) => [
		clsName,
		awilix.asClass(cls as Constructor<unknown>).classic(),
	]),

	...mapObject(repositories, (_clsName, cls) => [
		cls.usedAs,
		awilix.asClass(cls as Constructor<unknown>).classic(),
	]),
});
