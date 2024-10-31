import type { Prisma, PrismaClient } from "@prisma/client";
import type { Except } from "type-fest";
import type { Post } from "~/domain/entities";
import type { ExtendedModel } from "~/infra/database/repositories/types";

export class PostsRepository {
	static usedAs = "postsRepository";

	constructor(private readonly prisma: PrismaClient) {}

	create(data: Post) {
		return this.prisma.post.create({ data });
	}

	update(params: {
		where: Prisma.PostWhereUniqueInput;
		data: Prisma.PostUpdateInput;
	}) {
		return this.prisma.post.update(params);
	}

	delete(where: Prisma.PostWhereUniqueInput) {
		return this.prisma.post.delete({ where });
	}

	async findMany(
		params?: Except<Prisma.PostFindManyArgs, "include" | "select" | "omit">,
	): Promise<Post[]> {
		const posts = await this.prisma.post.findMany(params);

		return posts.map(PostsRepository.toDomain)
	}

	async findUnique(where: Prisma.PostWhereUniqueInput): AsyncTMaybe<Post> {
		const post = await this.prisma.post.findUnique({ where });

		return PostsRepository.toDomain(post)
	}

	static toDomain<T extends Post, K extends ExtendedModel<"post"> | null>(post: K) {
		return post as unknown as K extends null ? T | null : T;
	}
}
