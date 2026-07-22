import { z } from "zod";
import type {
	IUseCase,
	IUseCaseResponse,
	RequestContext,
} from "~/application/types";
import { Validate, zSafeString } from "~/application/utils";
import { right } from "~/core/logic";
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
		const _user = await this.usersRepository.findUnique({ id: data.id });

		return right({
			message: "User retrieved successfully",
			detail: {
				name: "John Doe",
			},
		});
	}
}
