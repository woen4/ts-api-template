import type { ConditionalAddition } from "~/core/types/conditional-addition";
import type { User } from "~/domain/entities/user.entity";
import type { PostId, UserId } from "~/domain/ids";

export type Post<WithUser extends User | undefined = undefined> = {
	id: PostId;
	title: string;
	userId: UserId;
} & ConditionalAddition<WithUser, { user: User }>;
