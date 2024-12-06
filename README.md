# TS API

## Description

This is a modern template for build api's. This template is using TypeScript, Prisma, Hono, and other libraries to create a scalable and well-structured application.

## Technologies Used

- **TypeScript**: A programming language that adds static typing to JavaScript.
- **Prisma**: ORM for Node.js and TypeScript.
- **Hono**: Web framework for creating fast and secure APIs.
- **Zod**: Schema validation library.
- **Awilix**: Dependency injection container.

## Available Scripts

- `dev`: Starts the development server.
- `type:check`: Checks TypeScript types.
- `prepare`: Sets up Husky for Git hooks.
- `plop`: Generates boilerplate files using Plop.

## How to Run the Project

1. Clone the repository:

```sh
git clone <repository-url>
```

2. Install the dependencies:

```sh
bun install
```

3. Start the development server:

```sh
bun run dev
```

## Folder Structure

- **src/**: Contains the application source code.
  - **application/**: Use cases and application logic.
  - **core/**: Core logic and utilities.
  - **domain/**: Domain entities.
  - **infra/**: Infrastructure implementations.
- **prisma/**: Prisma schemas.
- **plop/**: Code generation templates.

## Contribution

1. Fork the project.
2. Create a new branch (`git checkout -b feature/new-feature`).
3. Commit your changes (`git commit -m 'Add new feature'`).
4. Push to the branch (`git push origin feature/new-feature`).
5. Open a Pull Request.

## License

This project is licensed under the MIT License.
