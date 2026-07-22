import type { NodePlopAPI } from "plop";
import pluralize from "pluralize";

export default function (plop: NodePlopAPI) {
	const parseBrandedFields = (text: string) =>
		text
			.split(",")
			.map((field) => field.trim())
			.filter(Boolean)
			.map((field) => {
				const [name, converter] = field.split(":").map((part) => part.trim());

				if (!name || !converter) {
					return null;
				}

				return { name, converter };
			})
			.filter(
				(field): field is { name: string; converter: string } => field !== null,
			);

	plop.setHelper("pluralize", (text) => pluralize(text));
	plop.setHelper("singularize", (text) => pluralize.singular(text));
	plop.setHelper(
		"capitalize",
		(text) => text.charAt(0).toUpperCase() + text.slice(1),
	);
	plop.setHelper("lowercase", (text) => text.toLowerCase());
	plop.setHelper("brandImports", (text) => {
		const fields = parseBrandedFields(String(text ?? ""));

		if (fields.length === 0) {
			return "";
		}

		const imports = [...new Set(fields.map((field) => field.converter))].sort();

		return `import { ${imports.join(", ")} } from "~/domain/ids";`;
	});
	plop.setHelper("brandAssignments", (text, sourceName = "record") => {
		const fields = parseBrandedFields(String(text ?? ""));

		if (fields.length === 0) {
			return "";
		}

		return fields
			.map(
				(field) =>
					`\t\t\t${field.name}: ${field.converter}(${sourceName}.${field.name}),`,
			)
			.join("\n");
	});

	plop.setGenerator("repository", {
		description: "Database Repository",
		prompts: [
			{
				type: "input",
				name: "name",
				message: "Model Name:",
			},
			{
				type: "input",
				name: "brandedFields",
				message:
					"Branded fields (optional, format field:converter,field:converter):",
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
