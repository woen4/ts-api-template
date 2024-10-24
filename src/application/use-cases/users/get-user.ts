import * as v from "valibot";
import { ValidationError } from "~/application/errors/validation.error";
import type { IUseCase, IUseCaseResponse } from "~/application/types";
import type { DomainError } from "~/application/types/domain-error";
import { vSecureString } from "~/application/utils";
import { type AsyncEither, left, right } from "~/core/logic";

import type { UsersRepository } from "~/infra/database/repositories";

type GetUserResponse = AsyncEither<DomainError, IUseCaseResponse>;

const schema = v.object({
	id: v.pipe(vSecureString, v.uuid()),
});

export class GetUserUseCase implements IUseCase {
	constructor(private readonly usersRepository: UsersRepository) {}

	async handle(dto: v.InferInput<typeof schema>): GetUserResponse {
		const payload = v.safeParse(schema, dto);

		if (!payload.success) return left(new ValidationError(payload.issues));

		const user = await this.usersRepository.findWithPosts({});

		return right({
			message: "User retrivied successfully",
			detail: {
				user,
				values: [3, 2, 1].toSorted(),
			},
		});
	}
}
