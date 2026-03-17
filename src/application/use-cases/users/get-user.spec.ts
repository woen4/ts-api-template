import { describe, expect, it, vi } from "vitest";
import { ErrorCodes } from "~/application/types/domain-error";
import { GetUserUseCase } from "./get-user";

const mockUsersRepository = {
	create: vi.fn(),
	update: vi.fn(),
	delete: vi.fn(),
	findMany: vi.fn(),
	findUnique: vi.fn(),
};

describe("GetUserUseCase", () => {
	it("should return user data when user exists", async () => {
		mockUsersRepository.findUnique.mockResolvedValue({
			id: "user@test.com",
			name: "Jane Doe",
		});

		const useCase = new GetUserUseCase(
			mockUsersRepository as unknown as ConstructorParameters<
				typeof GetUserUseCase
			>[0],
		);

		const result = await useCase.handle({ id: "user@test.com" });

		expect(result.isRight()).toBe(true);

		if (result.isRight()) {
			expect(result.value.detail.name).toBe("Jane Doe");
		}
	});

	it("should return error when user not found", async () => {
		mockUsersRepository.findUnique.mockResolvedValue(null);

		const useCase = new GetUserUseCase(
			mockUsersRepository as unknown as ConstructorParameters<
				typeof GetUserUseCase
			>[0],
		);

		const result = await useCase.handle({ id: "missing@test.com" });

		expect(result.isLeft()).toBe(true);

		if (result.isLeft()) {
			expect(result.value.code).toBe(ErrorCodes.GENERIC_ERROR);
		}
	});

	it("should return validation error for non-email id", async () => {
		const useCase = new GetUserUseCase(
			mockUsersRepository as unknown as ConstructorParameters<
				typeof GetUserUseCase
			>[0],
		);

		const result = await useCase.handle({ id: "not-an-email" });

		expect(result.isLeft()).toBe(true);

		if (result.isLeft()) {
			expect(result.value.code).toBe(ErrorCodes.VALIDATION_ERROR);
		}
	});
});
