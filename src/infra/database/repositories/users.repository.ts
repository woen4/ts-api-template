import type { Prisma, PrismaClient } from "@prisma/client";
import type { Except } from "type-fest";
import type { Post, User } from "~/domain/entities";

export class UsersRepository {
	static usedAs = "usersRepository";

	constructor(private readonly prisma: PrismaClient) {}

	create(data: Prisma.UserCreateInput) {
		return this.prisma.user.create({ data });
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

	findMany(
		params?: Except<Prisma.UserFindManyArgs, "include" | "select" | "omit">,
	): Promise<User[]> {
		return this.prisma.user.findMany(params);
	}

	findUnique(where: Prisma.UserWhereUniqueInput): AsyncMaybe<User> {
		return this.prisma.user.findUnique({ where });
	}

	findWithPostsAndReels(
		params: Except<Prisma.UserFindManyArgs, "include" | "select" | "omit">,
	): Promise<User<Post>[]> {
		return this.prisma.user.findMany({
			...params,
			include: {
				posts: true,
			},
		});
	}
}
