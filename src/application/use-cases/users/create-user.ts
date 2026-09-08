import { z } from "zod";
import type {
	IUseCase,
	IUseCaseResponse,
	RequestContext,
} from "~/application/types";
import { Validate, zSafeString } from "~/application/utils";
import { ok } from "~/core/logic";
import { toUserId } from "~/domain/ids";
import type { IUsersRepository } from "~/infra/database/repositories";

const schema = z.object({
	id: zSafeString(z.string()).transform(toUserId),
});

export type CreateUserRequest = z.infer<typeof schema>;

export type CreateUserResponse = IUseCaseResponse<{
	id: string;
}>;

export class CreateUserUseCase
	implements IUseCase<CreateUserRequest, CreateUserResponse>
{
	constructor(private readonly usersRepository: IUsersRepository) {}

	@Validate(schema)
	async handle(data: CreateUserRequest, _ctx: RequestContext) {
		const user = await this.usersRepository.create({
			id: data.id,
			name: "John Doe",
		});

		return ok({
			message: "User created successfully",
			detail: {
				id: user.id,
			},
		});
	}
}
