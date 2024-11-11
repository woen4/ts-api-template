import { z } from "zod";
import type { IUseCase, IUseCaseResponse } from "~/application/types";
import type { DomainError } from "~/application/types/domain-error";
import { Validate, zSafeString } from "~/application/utils";
import { type AsyncEither, right } from "~/core/logic";

import type { UsersRepository } from "~/infra/database/repositories";

type GetUserResponse = IUseCaseResponse<{
	name: string;
}>;

const schema = z.object({
	id: zSafeString(z.string().email()),
});

export class GetUserUseCase implements IUseCase {
	constructor(private readonly usersRepository: UsersRepository) {}

	@Validate(schema)
	async handle(
		data: z.infer<typeof schema>,
	): AsyncEither<DomainError, GetUserResponse> {
		const _user = await this.usersRepository.findUnique({ id: data.id });
		/*  */
		return right({
			message: "User retrieved successfully",
			detail: {
				name: "John Doe",
			},
		});
	}
}
