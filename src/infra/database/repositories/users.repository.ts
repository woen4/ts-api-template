import type { Prisma, PrismaClient } from "@prisma/client";
import type { Except } from "type-fest";
import type { Post, User } from "~/domain/entities";
import type { ExtendedModel } from "~/infra/database/repositories/types";

export class UsersRepository {
	static usedAs = "usersRepository";

	constructor(private readonly prisma: PrismaClient) {}

	create(data: User) {
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

	async findMany(
		params?: Except<Prisma.UserFindManyArgs, "include" | "select" | "omit">,
	): Promise<User[]> {
		const users = await this.prisma.user.findMany(params);

		return users;
	}

	async findUnique(where: Prisma.UserWhereUniqueInput): AsyncTMaybe<User> {
		const user = await this.prisma.user.findUnique({ where });

		if (!user) return null;

		return UsersRepository.toDomain<User>(user);
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

		return users.map(UsersRepository.toDomain<User<Post>>);
	}

	static toDomain<T extends User>(user: ExtendedModel<"user">) {
		return user as unknown as T;
	}
}
