import { z } from "zod";
import { ValidationError } from "~/application/errors/validation.error";
import type { IUseCase, IUseCaseResponse } from "~/application/types";
import type { DomainError } from "~/application/types/domain-error";
import { zSafeString } from "~/application/utils";
import { type AsyncEither, left, right } from "~/core/logic";

import type { UsersRepository } from "~/infra/database/repositories";

type GetUserResponse = IUseCaseResponse<{
	name: string;
}>;

const schema = z.object({
	id: zSafeString(z.string()),
});

export class GetUserUseCase implements IUseCase {
	constructor(private readonly usersRepository: UsersRepository) {}

	async handle(
		dto: z.infer<typeof schema>,
	): AsyncEither<DomainError, GetUserResponse> {
		const payload = schema.safeParse(dto);

		if (!payload.success) return left(new ValidationError(payload.error));

		/* const user = await this.usersRepository.findUnique({
			id: payload.data.id,
		}); */

		return right({
			message: "User retrivied successfully",
			detail: {
				name: "kaio woen",
			},
		});
	}
}

const a = {} as GetUserResponse;
