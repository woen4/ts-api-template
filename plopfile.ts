import type { NodePlopAPI } from "plop";
import pluralize from "pluralize";

export default function (plop: NodePlopAPI) {
	plop.setHelper("pluralize", (text) => pluralize(text));
	plop.setHelper("singularize", (text) => pluralize.singular(text));
	plop.setHelper(
		"capitalize",
		(text) => text.charAt(0).toUpperCase() + text.slice(1),
	);
	plop.setHelper("lowercase", (text) => text.toLowerCase());

	plop.setGenerator("repository", {
		description: "Database Repository",
		prompts: [
			{
				type: "input",
				name: "name",
				message: "Model Name:",
			},
		],
		actions: [
			{
				type: "add",
				path: "src/infra/database/repositories/{{pluralize (lowercase name)}}.repository.ts",
				templateFile: "plop/repository.hbs",
			},
		],
	});
}
