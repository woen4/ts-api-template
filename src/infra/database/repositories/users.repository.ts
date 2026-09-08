import type { Post, User } from "~/domain/entities";
import { toPostId, toUserId } from "~/domain/ids";
import type { Db } from "~/infra/database";
import type { ExtendedModel } from "~/infra/database/repositories/types";

type UserCollection = Db["orm"]["public"]["User"];

export type UserWhere = Parameters<UserCollection["where"]>[0];
export type UserCreate = Parameters<UserCollection["create"]>[0];
export type UserUpdate = Parameters<
	ReturnType<UserCollection["where"]>["update"]
>[0];

export type IUsersRepository = UsersRepository;

export class UsersRepository {
	static usedAs = "usersRepository";

	constructor(private readonly db: Db) {}

	private get users() {
		return this.db.orm.public.User;
	}

	create(data: UserCreate) {
		return this.users
			.create(data)
			.then((user) => UsersRepository.toDomain(user));
	}

	update(params: { where: UserWhere; data: UserUpdate }) {
		return this.users.where(params.where).update(params.data);
	}

	delete(where: UserWhere) {
		return this.users.where(where).delete();
	}

	async findMany(where?: UserWhere): Promise<User[]> {
		const users = await (where ? this.users.where(where) : this.users).all();

		return users.map((user) => UsersRepository.toDomain(user));
	}

	async findUnique(where: UserWhere) {
		const user = await this.users.where(where).first();

		if (!user) return null;

		return UsersRepository.toDomain(user);
	}

	async findWithPosts(where?: UserWhere): Promise<User<Post>[]> {
		const users = await (where ? this.users.where(where) : this.users)
			.include("posts", (posts) => posts.select("id", "title", "userId"))
			.all();

		return users.map((user) => UsersRepository.toDomainWithPosts(user));
	}

	static toDomain(record: ExtendedModel<"User">): User {
		return {
			...record,
			id: toUserId(record.id),
		};
	}

	static toDomainWithPosts(
		record: ExtendedModel<"User"> & {
			posts: readonly { id: string; title: string; userId: string }[];
		},
	): User<Post> {
		return {
			...UsersRepository.toDomain(record),
			posts: record.posts.map((post) => ({
				id: toPostId(post.id),
				title: post.title,
				userId: toUserId(post.userId),
			})),
		};
	}
}
