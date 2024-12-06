import { z } from "zod";
import type { IUseCase, IUseCaseResponse } from "~/application/types";
import { Validate, zSafeString } from "~/application/utils";
import { right } from "~/core/logic";
import type { IUsersRepository } from "~/infra/database/repositories";

const schema = z.object({
	id: zSafeString(z.string()),
});

export type CreateUserRequest = z.infer<typeof schema>;

export type CreateUserResponse = IUseCaseResponse<{
	id: string;
}>;

export class CreateUserUseCase implements IUseCase<CreateUserResponse> {
	constructor(private readonly usersRepository: IUsersRepository) {}

	@Validate(schema)
	async handle(data: CreateUserRequest) {
		const user = await this.usersRepository.create({
			id: data.id,
			name: "John Doe",
		});

		return right({
			message: "User retrieved successfully",
			detail: {
				id: user.id,
			},
		});
	}
}
