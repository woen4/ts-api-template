import { PrismaPg } from "@prisma/adapter-pg";
import { defineConfig } from "prisma/config";

export default defineConfig({
	datasource: {
		url: process.env.DATABASE_URL ?? "",
	},
	migrate: {
		async adapter(env) {
			return new PrismaPg({ connectionString: env.DATABASE_URL ?? "" });
		},
	},
});
