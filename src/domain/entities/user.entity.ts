import type { ConditionalAddition } from "~/core/types/conditional-addition";
import type { Post } from "~/domain/entities/post.entity";

export type User<WithPosts extends Post | undefined = undefined> = {
	id: string;
	name: string;
} & ConditionalAddition<WithPosts, { posts: Post[] }>;
