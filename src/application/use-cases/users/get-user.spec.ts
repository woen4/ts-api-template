import { describe, expect, it } from "bun:test";
import { ErrorCodes, type RequestContext } from "~/application/types";
import { toUserId } from "~/domain/ids";
import type { IUsersRepository } from "~/infra/database/repositories";
import { GetUserUseCase } from "./get-user";

const makeUsersRepository = (overrides: Partial<IUsersRepository>) =>
	overrides as unknown as IUsersRepository;

const ctx: RequestContext = { auth: null };

describe("GetUserUseCase", () => {
	it("returns the user name when the user exists", async () => {
		const repo = makeUsersRepository({
			findUnique: async () => ({ id: toUserId("user_1"), name: "Alice" }),
		});

		const useCase = new GetUserUseCase(repo);

		const { data, error } = await useCase.handle(
			{ id: toUserId("user_1") },
			ctx,
		);

		expect(error).toBeUndefined();
		expect(data?.detail.name).toBe("Alice");
	});

	it("returns a not-found error when the user does not exist", async () => {
		const repo = makeUsersRepository({
			findUnique: async () => null,
		});

		const useCase = new GetUserUseCase(repo);

		const { data, error } = await useCase.handle(
			{ id: toUserId("ghost") },
			ctx,
		);

		expect(data).toBeUndefined();
		expect(error?.code).toBe(ErrorCodes.NOT_FOUND_ERROR);
	});

	it("returns a validation error when the id is not a safe string", async () => {
		const repo = makeUsersRepository({
			findUnique: async () => null,
		});

		const useCase = new GetUserUseCase(repo);

		const { data, error } = await useCase.handle(
			{ id: toUserId("<script>") },
			ctx,
		);

		expect(data).toBeUndefined();
		expect(error?.code).toBe(ErrorCodes.VALIDATION_ERROR);
	});
});
