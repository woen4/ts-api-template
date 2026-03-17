import { z } from "zod";
import { GenericError } from "~/application/errors/generic.error";
import type { IUseCase, IUseCaseResponse } from "~/application/types";
import { Validate, zSafeString } from "~/application/utils";
import { left, right } from "~/core/logic";
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
		const user = await this.usersRepository.findUnique({ id: data.id });

		if (!user) {
			return left(new GenericError({ message: "User not found" }));
		}

		return right({
			message: "User retrieved successfully",
			detail: {
				name: user.name,
			},
		});
	}
}
