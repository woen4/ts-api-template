import { z } from "zod";
import type { IUseCase, IUseCaseResponse } from "~/application/types";
import { Validate, zSafeString } from "~/application/utils";
import { right } from "~/core/logic";
import type { IUsersRepository } from "~/infra/database/repositories";

const schema = z.object({
	id: zSafeString(z.string().email()),
});

export type GetUserRequest = z.infer<typeof schema>;

export type GetUserResponse = IUseCaseResponse<{
	name: string;
}>;

export class GetUserUseCase implements IUseCase<GetUserResponse> {
	constructor(private readonly usersRepository: IUsersRepository) {}

	@Validate(schema)
	async handle(data: GetUserRequest) {
		const _user = await this.usersRepository.findWithPosts({});

		return right({
			message: "User retrieved successfully",
			detail: {
				name: "John Doe",
			},
		});
	}
}
