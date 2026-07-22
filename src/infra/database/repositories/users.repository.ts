import type { Prisma, PrismaClient } from "@prisma/client";
import type { Except } from "type-fest";
import type { Post, User } from "~/domain/entities";
import { toPostId, toUserId } from "~/domain/ids";
import type { ExtendedModel } from "~/infra/database/repositories/types";

export type IUsersRepository = UsersRepository;

export class UsersRepository {
	static usedAs = "usersRepository";

	constructor(private readonly prisma: PrismaClient) {}

	create(data: User) {
		return this.prisma.user
			.create({ data })
			.then((user) => UsersRepository.toDomain(user));
	}

	update(params: {
		where: Prisma.UserWhereUniqueInput;
		data: Prisma.UserUpdateInput;
	}) {
		return this.prisma.user.update(params);
	}

	delete(where: Prisma.UserWhereUniqueInput) {
		return this.prisma.user.delete({ where });
	}

	async findMany(
		params?: Except<Prisma.UserFindManyArgs, "include" | "select" | "omit">,
	): Promise<User[]> {
		const users = await this.prisma.user.findMany(params);

		return users.map((user) => UsersRepository.toDomain(user));
	}

	async findUnique(where: Prisma.UserWhereUniqueInput) {
		const user = await this.prisma.user.findUnique({ where });

		if (!user) return null;

		return UsersRepository.toDomain(user);
	}

	async findWithPosts(
		params: Except<Prisma.UserFindManyArgs, "include" | "select" | "omit">,
	): Promise<User<Post>[]> {
		const users = await this.prisma.user.findMany({
			...params,
			include: {
				posts: true,
			},
		});

		return users.map((user) => UsersRepository.toDomainWithPosts(user));
	}

	static toDomain(record: ExtendedModel<"user">): User {
		return {
			...record,
			id: toUserId(record.id),
		};
	}

	static toDomainWithPosts(record: ExtendedModel<"user">): User<Post> {
		return {
			...UsersRepository.toDomain(record),
			posts: Array.isArray(record.posts)
				? record.posts.map((post) => ({
						...post,
						id: toPostId(post.id),
						userId: toUserId(post.userId),
					}))
				: [],
		};
	}
}
