import { z } from "zod";
import { NotFoundError } from "~/application/errors/not-found.error";
import type {
	IUseCase,
	IUseCaseResponse,
	RequestContext,
} from "~/application/types";
import { Validate, zSafeString } from "~/application/utils";
import { fail, ok } from "~/core/logic";
import { toUserId } from "~/domain/ids";
import type { IUsersRepository } from "~/infra/database/repositories";

const schema = z.object({
	id: zSafeString(z.string()).transform(toUserId),
});

export type GetUserRequest = z.infer<typeof schema>;

export type GetUserResponse = IUseCaseResponse<{
	name: string;
}>;

export class GetUserUseCase
	implements IUseCase<GetUserRequest, GetUserResponse>
{
	constructor(private readonly usersRepository: IUsersRepository) {}

	@Validate(schema)
	async handle(data: GetUserRequest, _ctx: RequestContext) {
		const user = await this.usersRepository.findUnique({ id: data.id });

		if (!user) return fail(new NotFoundError(`User "${data.id}" not found`));

		return ok({
			message: "User retrieved successfully",
			detail: {
				name: user.name,
			},
		});
	}
}
