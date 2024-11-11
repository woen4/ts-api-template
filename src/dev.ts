import path from "node:path";
import { serve } from "@hono/node-server";
import Bun from "bun";
import { showRoutes } from "hono/dev";
import { app } from "~/infra";

showRoutes(app);
serve({ fetch: app.fetch, port: 3333 });

const genTypes = async () => {
	Bun.spawnSync([
		"tsc",
		"--declaration",
		"--emitDeclarationOnly",
		"--outFile",
		"index.d.ts",
		"--incremental",
	]);

	const declarationFilePath = path.join(
		import.meta.dirname,
		"..",
		"index.d.ts",
	);

	const file = await Bun.file(declarationFilePath).text();

	const result = file
		.replaceAll(/declare module ".*" {/gm, "declare module '@api-types' {")
		.replaceAll(/from "src.*?"/gm, 'from  "@api-types"');

	Bun.write(declarationFilePath, result);
};
// Type generation can be made after server starts
genTypes();
