import type { User } from "~/domain/entities/user.entity";

export type Post<WithUser extends User | undefined = undefined> = {
	id: string;
	title: string;
	userId: string;
} & ConditionalAddition<WithUser, { user: User }>;
