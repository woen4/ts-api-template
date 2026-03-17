import { describe, expect, it, vi } from "vitest";
import { ErrorCodes } from "~/application/types/domain-error";
import { CreateUserUseCase } from "./create-user";

const mockUsersRepository = {
	create: vi.fn(),
	update: vi.fn(),
	delete: vi.fn(),
	findMany: vi.fn(),
	findUnique: vi.fn(),
};

describe("CreateUserUseCase", () => {
	it("should create a user and return the id", async () => {
		mockUsersRepository.create.mockResolvedValue({
			id: "valid-id",
			name: "John Doe",
		});

		const useCase = new CreateUserUseCase(
			mockUsersRepository as unknown as ConstructorParameters<
				typeof CreateUserUseCase
			>[0],
		);

		const result = await useCase.handle({ id: "valid-id" });

		expect(result.isRight()).toBe(true);

		if (result.isRight()) {
			expect(result.value.detail.id).toBe("valid-id");
		}

		expect(mockUsersRepository.create).toHaveBeenCalledWith({
			id: "valid-id",
			name: "John Doe",
		});
	});

	it("should return validation error for unsafe input", async () => {
		const useCase = new CreateUserUseCase(
			mockUsersRepository as unknown as ConstructorParameters<
				typeof CreateUserUseCase
			>[0],
		);

		const result = await useCase.handle({
			id: "DROP TABLE users;--",
		});

		expect(result.isLeft()).toBe(true);

		if (result.isLeft()) {
			expect(result.value.code).toBe(ErrorCodes.VALIDATION_ERROR);
		}
	});
});
