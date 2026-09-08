import { describe, expect, it } from "bun:test";
import { ErrorCodes, type RequestContext } from "~/application/types";
import { toUserId } from "~/domain/ids";
import type { IUsersRepository } from "~/infra/database/repositories";
import { CreateUserUseCase } from "./create-user";

const makeUsersRepository = (overrides: Partial<IUsersRepository>) =>
	overrides as unknown as IUsersRepository;

const ctx: RequestContext = { auth: null };

describe("CreateUserUseCase", () => {
	it("returns the created user id", async () => {
		const repo = makeUsersRepository({
			create: async () => ({ id: toUserId("user_1"), name: "John Doe" }),
		});

		const useCase = new CreateUserUseCase(repo);

		const { data, error } = await useCase.handle(
			{ id: toUserId("user_1") },
			ctx,
		);

		expect(error).toBeUndefined();
		expect(data?.detail.id).toBe("user_1");
	});

	it("returns a validation error when the id is not a safe string", async () => {
		const repo = makeUsersRepository({
			create: async () => ({ id: toUserId("user_1"), name: "John Doe" }),
		});

		const useCase = new CreateUserUseCase(repo);

		const { data, error } = await useCase.handle(
			{ id: toUserId("<script>") },
			ctx,
		);

		expect(data).toBeUndefined();
		expect(error?.code).toBe(ErrorCodes.VALIDATION_ERROR);
	});
});
