<div align="center">

# ⚡ TS API Template

**An opinionated architecture proposal for building type-safe, scalable Node.js APIs.**

_Layered design · Functional error handling · Dependency injection · End-to-end type safety_

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Bun-000000?style=flat-square&logo=bun&logoColor=white)](https://bun.sh/)
[![Hono](https://img.shields.io/badge/Hono-E36002?style=flat-square&logo=hono&logoColor=white)](https://hono.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Zod](https://img.shields.io/badge/Zod-3E67B1?style=flat-square&logo=zod&logoColor=white)](https://zod.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

</div>

---

## 💡 Philosophy

This template is not just a folder structure — it is an **architecture proposal**. The goal is to make the _right way_ the _easy way_:

- **Business logic never touches HTTP.** Use cases receive plain validated data and return a `Result`, no `req`/`res` in sight.
- **Errors are values, not exceptions.** Every use case returns a destructurable `Result` — `{ data }` or `{ error }`, never both — and the compiler forces you to handle failure.
- **One generic handler for every route.** Parsing, validation, error → HTTP status mapping and redirects are solved once, in one place.
- **The container wires itself.** Register a class following the convention and it becomes injectable — no manual wiring ceremony.
- **Types flow end-to-end.** From branded IDs in the domain all the way to auto-generated `@api-types` declarations your frontend can consume.

## 🧱 Tech Stack

| Tool | Role |
|---|---|
| [**TypeScript**](https://www.typescriptlang.org/) | Strict static typing everywhere |
| [**Bun**](https://bun.sh/) | Runtime, package manager & watcher |
| [**Hono**](https://hono.dev/) | Fast, minimal web framework (CORS, CSRF, secure headers, body limit out of the box) |
| [**Prisma**](https://www.prisma.io/) | Contract-based ORM for PostgreSQL |
| [**Zod**](https://zod.dev/) | Runtime schema validation at the use-case boundary |
| [**Awilix**](https://github.com/jeffijoe/awilix) | Dependency injection container |
| [**Plop**](https://plopjs.com/) | Code generation for new modules |
| [**Biome**](https://biomejs.dev/) + Husky + Commitlint | Formatting, linting & commit hygiene |

## 🏛️ Architecture

Dependencies always point **inward**. The outer layers know the inner ones — never the opposite.

```mermaid
graph LR
    subgraph infra ["🔌 infra"]
        HTTP["HTTP routes<br/>(Hono)"]
        REPO["Repositories<br/>(Prisma)"]
        PROV["Providers<br/>(Mail, ...)"]
        DI["DI Container<br/>(Awilix)"]
    end
    subgraph application ["⚙️ application"]
        UC["Use Cases"]
        ERR["Domain Errors"]
    end
    subgraph domain ["🏷️ domain"]
        ENT["Entities"]
        IDS["Branded IDs"]
    end
    subgraph core ["🧬 core"]
        EITHER["Result / match / Option"]
        TYPES["Type utilities"]
    end

    HTTP --> UC
    UC --> ENT
    UC --> ERR
    REPO --> ENT
    ENT --> TYPES
    UC --> EITHER
```

| Layer | Path | Responsibility |
|---|---|---|
| **core** | [src/core/](src/core/) | Framework-agnostic building blocks: `Result`, `match`, `Option`, `Lazy`, branded types, type utilities. Zero dependencies. |
| **domain** | [src/domain/](src/domain/) | Entities and branded IDs (`UserId`, `PostId`, `TenantId`). Pure types — no I/O, no libraries. |
| **application** | [src/application/](src/application/) | Use cases, domain errors and the validation decorator. Orchestrates the domain; knows nothing about HTTP. |
| **infra** | [src/infra/](src/infra/) | The outside world: Hono routes, Prisma repositories, external providers and the DI container. |

### 🔄 Request lifecycle

Every route is a one-liner. The generic [`defaultHandler`](src/infra/http/routes/default-handler.ts) does the rest:

```ts
usersRoutesV1.get("/:id", defaultHandler(diContainer.cradle.GetUserUseCase));
usersRoutesV1.post("/", defaultHandler(diContainer.cradle.CreateUserUseCase));
```

```mermaid
sequenceDiagram
    participant C as Client
    participant H as defaultHandler
    participant U as Use Case
    participant R as Repository

    C->>H: HTTP request
    H->>H: Merge body + query + params
    H->>U: handle(payload, requestContext)
    U->>U: @Validate(zodSchema)
    alt invalid payload
        U-->>H: fail(ValidationError)
        H-->>C: 422 + error body
    else valid
        U->>R: typed repository call
        R-->>U: domain entity
        U-->>H: ok({ message, detail })
        H-->>C: 200 JSON (or redirect)
    end
```

1. **`defaultHandler`** merges body, query string and route params into a single payload and builds a `RequestContext` from the JWT payload.
2. **`@Validate(schema)`** parses the payload with Zod *before* the use case body runs — invalid input short-circuits into a `ValidationError`.
3. **The use case** does its work and returns `fail(error)` or `ok(response)`.
4. **`StatusErrorCodeMapper`** translates domain error codes into HTTP statuses. The use case never knows HTTP exists.

### 🚦 Errors are values — `Result<TData, TError>`

No `try/catch` spaghetti, no wrapper objects to unwrap. A result is a plain object with **exactly one** of two keys:

```ts
export type Ok<TData>    = { data: TData;      error?: never };
export type Fail<TError> = { data?: never;     error: TError };

export type Result<TData, TError> = Ok<TData> | Fail<TError>;
```

The `?: never` on each side is what makes it work: destructure once, check `error`, and TypeScript narrows `data` for you — no casts, no type guards, no `.isLeft()`.

```ts
const { data, error } = await useCase.handle(payload, ctx);

if (error) return handleError(error);

data.detail.name; // ✅ já estreitado para o tipo de sucesso
```

Producing one is just as plain:

```ts
export class GetUserUseCase implements IUseCase<GetUserRequest, GetUserResponse> {
	constructor(private readonly usersRepository: IUsersRepository) {}

	@Validate(schema)
	async handle(data: GetUserRequest, _ctx: RequestContext) {
		const user = await this.usersRepository.findUnique({ id: data.id });

		if (!user) return fail(new NotFoundError(`User "${data.id}" not found`));

		return ok({
			message: "User retrieved successfully",
			detail: { name: user.name },
		});
	}
}
```

> **Repositories and providers never return a `Result`.** They return the entity, `null`, or **throw**. Infrastructure failures (database down, unique violation, external API) bubble up to the global error handler and become a `500` — only validation and business rules travel as `Result`.

Domain error codes map to HTTP statuses in exactly one place:

| Domain error | HTTP status |
|---|---|
| `VALIDATION_ERROR` | `422` |
| `NOT_FOUND_ERROR` | `404` |
| `DUPLICATED_ENTITY_ERROR` | `409` |
| `GENERIC_ERROR` | `400` |
| `UNAUTHORIZED_ERROR` | `401` |
| `FORBID_ERROR` | `403` |
| uncaught infra `throw` | `500` |

### 🎯 Pattern matching

The mapping above isn't a `switch` with a `default` that silently swallows new cases — it is an **exhaustive match**:

```ts
export const StatusErrorCodeMapper = (errorCode: ErrorCodes) =>
	match(errorCode)
		.with(ErrorCodes.VALIDATION_ERROR, () => 422 as const)
		.with(ErrorCodes.NOT_FOUND_ERROR, () => 404 as const)
		.with(ErrorCodes.DUPLICATED_ENTITY_ERROR, () => 409 as const)
		.with(ErrorCodes.GENERIC_ERROR, () => 400 as const)
		.with(ErrorCodes.UNAUTHORIZED_ERROR, () => 401 as const)
		.with(ErrorCodes.FORBID_ERROR, () => 403 as const)
		.exhaustive();
```

Every `.with()` subtracts the handled members from the union it still has to cover, and `.exhaustive()` only compiles when nothing is left. **Add a member to `ErrorCodes` and this file stops compiling** until you give it a status — the compiler names the missing case for you:

```
Property '[nonExhaustive]' is missing in type
  'MatchBuilder<ErrorCodes, ErrorCodes.CONFLICT_ERROR, ...>'
```

The builder returns the union of every branch's return type (`422 | 404 | 409 | 400 | 401 | 403` above — literals, not `number`).

| Method | Purpose |
|---|---|
| `.with(...patterns, handler)` | Match one or more exact values; removes them from the remaining union |
| `.when(predicate, handler)` | Match by predicate — a type predicate (`v is X`) also narrows the remaining union |
| `.exhaustive()` | Terminate, requiring full coverage at compile time |
| `.otherwise(handler)` | Terminate with a catch-all when exhaustiveness isn't wanted |

For the `Result` type specifically there's `matchResult`, where both branches are mandatory — it's how the HTTP adapter turns a use case's output into a response:

```ts
return matchResult(response, {
	fail: (error) => ctx.json(error, StatusErrorCodeMapper(error.code)),
	ok: (data) => ctx.json(data, 200),
});
```

### 🏷️ Branded IDs — no more mixed-up strings

`UserId` and `PostId` are both strings at runtime, but the compiler refuses to let you swap them:

```ts
export type UserId = Brand<string, "UserId">;

const userId = toUserId(raw);          // ✅ explicit conversion at the boundary
postsRepository.findUnique({ id: userId }); // ❌ compile error: UserId is not PostId
```

Zod schemas convert at the edge (`.transform(toUserId)`), so everything past validation is already branded.

### 📦 Self-wiring DI container

The [container](src/infra/di-container.ts) registers by **convention, not configuration**. Classes declare the name they should be injected as:

```ts
export class UsersRepository implements IUsersRepository {
	static usedAs = "usersRepository";
	// ...
}
```

Every use case, repository and provider exported from its barrel file is auto-registered — adding a new one requires **zero changes** to the container. Constructor parameter names resolve dependencies automatically:

```ts
constructor(private readonly usersRepository: IUsersRepository) {}
//                          ^ matches "usedAs" → injected
```

### 🤝 Type-safe frontend contract

`dev.ts` emits a bundled `index.d.ts` and rewrites its module paths to a single **`@api-types`** module — your frontend imports the request/response types of every use case (`CreateUserRequest`, `GetUserResponse`, ...) straight from the API, with no codegen pipeline or duplicated DTOs.

### 🧬 Core utilities

The [core layer](src/core/) ships small functional primitives used across the codebase:

- **`Result` / `AsyncResult`** — destructurable success/failure, plus `ok`, `fail`, `isOk`, `isFail`, `matchResult` and the `InferData` / `InferError` helpers
- **`match`** — exhaustive, fully typed pattern matching
- **`Option`** — explicit presence/absence
- **`Lazy`**, **`mapObject`**, **`Brand`**, **`ConditionalAddition`** — entities like `User<WithPosts>` include relations conditionally at the type level

## 🚀 Getting Started

**Prerequisites:** [Bun](https://bun.sh/) and a PostgreSQL database.

```sh
# 1. Clone
git clone <repository-url> && cd ts-api-template

# 2. Install
bun install

# 3. Configure
echo 'DATABASE_URL="postgres://user:pass@localhost:5432/mydb"' > .env

# 4. Initialize the database & emit the Prisma contract
bun run db:init
bun run contract:emit

# 5. Run 🎉
bun run dev
```

The API starts at `http://localhost:3333` with all routes printed to the console.

### 📜 Scripts

| Script | What it does |
|---|---|
| `bun run dev` | Dev server with watch mode + `@api-types` generation |
| `bun run test` | Run the colocated use-case specs |
| `bun run type:check` | Strict TypeScript check (`tsc --noEmit`) |
| `bun run plop` | Scaffold new modules from templates |
| `bun run contract:emit` | Regenerate the Prisma contract |
| `bun run db:init` | Initialize the database |
| `bun run migration:status` | Check migration status |

## 🧩 Extending the template

Adding a feature follows the same recipe every time:

1. **Entity & ID** → [src/domain/](src/domain/) — define the entity type and its branded ID.
2. **Repository** → [src/infra/database/repositories/](src/infra/database/repositories/) — set `static usedAs`, map Prisma rows to domain entities (`bun run plop` scaffolds this).
3. **Use case** → [src/application/use-cases/](src/application/use-cases/) — Zod schema, `@Validate`, return `ok(...)` / `fail(...)`, plus a colocated `.spec.ts`.
4. **Route** → [src/infra/http/routes/v1/](src/infra/http/routes/v1/) — one line: `defaultHandler(diContainer.cradle.YourUseCase)`.

No container edits. No handler boilerplate. No manual error mapping.

## 📁 Project Structure

```
src/
├── core/                  # Pure primitives — Result, match, Option, type utils
│   ├── logic/
│   └── types/
├── domain/                # Entities & branded IDs — zero dependencies
│   ├── entities/
│   └── ids.ts
├── application/           # Use cases, errors, validation
│   ├── errors/
│   ├── types/             # IUseCase, DomainError, RequestContext
│   ├── use-cases/         # <recurso>/<acao>-<recurso>.ts + .spec.ts colocado
│   └── utils/             # @Validate decorator
├── infra/                 # The outside world
│   ├── database/          # Prisma repositories
│   ├── http/routes/       # Hono routes + defaultHandler
│   ├── providers/         # External services (mail, ...)
│   └── di-container.ts    # Auto-wiring Awilix container
├── prisma/                # Generated contract + db client
└── dev.ts                 # Server entry + @api-types generation
```

## 🤝 Contributing

1. Fork the project
2. Create your branch: `git checkout -b feature/amazing-feature`
3. Commit (commitlint-checked): `git commit -m 'feat: add amazing feature'`
4. Push and open a Pull Request

## 📄 License

Distributed under the **MIT License**.

---

<div align="center">
Made with care — architecture is a feature. ⚙️
</div>
