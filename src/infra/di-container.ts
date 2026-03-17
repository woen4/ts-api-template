import type { Constructor, Resolver } from "awilix";
import * as awilix from "awilix";

import * as ErpSyncUseCase from "~/application/use-cases/erp-sync";
import * as UsersUseCase from "~/application/use-cases/users";
import { mapObject } from "~/core/logic";
import type { AsInstances } from "~/core/types/as-instances";
import { prismaClient } from "./database";
import * as repositories from "./database/repositories";

type IDiContainer = {
	prisma: typeof prismaClient;
} & AsInstances<typeof UsersUseCase> &
	AsInstances<typeof ErpSyncUseCase>;

export const diContainer = awilix.createContainer<IDiContainer>({
	injectionMode: "PROXY",
});

const useCases = {
	...UsersUseCase,
	...ErpSyncUseCase,
};

for (const cls of Object.values(useCases)) {
	if ("usedAs" in cls) {
		// @ts-expect-error add interdependent use-cases to the container
		useCases[cls.usedAs] = cls;
	}
}

type ClassWithUsedAs = { usedAs: string };

const asResolvers = (obj: object) => obj as Record<string, Resolver<unknown>>;

diContainer.register({
	prisma: awilix.asValue(prismaClient),

	...asResolvers(
		mapObject(useCases, (clsName, cls) => [
			clsName,
			awilix.asClass(cls as Constructor<unknown>).classic(),
		]),
	),

	...asResolvers(
		mapObject(repositories, (_clsName, cls) => [
			(cls as unknown as ClassWithUsedAs).usedAs,
			awilix.asClass(cls as Constructor<unknown>).classic(),
		]),
	),
});
