import type { ConditionalAddition } from "~/core/types/conditional-addition";
import type { Post } from "~/domain/entities/post.entity";
import type { UserId } from "~/domain/ids";

export type User<WithPosts extends Post | undefined = undefined> = {
	id: UserId;
	name: string;
} & ConditionalAddition<WithPosts, { posts: Post[] }>;
