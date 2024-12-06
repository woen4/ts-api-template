import { Hono } from "hono";
import { diContainer } from "~/infra/di-container";
import { defaultHandler } from "~/infra/http/routes/default-handler";

export const usersRoutesV1 = new Hono().basePath("/users");

usersRoutesV1.get("/:id", defaultHandler(diContainer.cradle.GetUserUseCase));
usersRoutesV1.post("/", defaultHandler(diContainer.cradle.CreateUserUseCase));
