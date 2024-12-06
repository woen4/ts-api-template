import { Hono } from "hono";
import { usersRoutesV1 } from "~/infra/http/routes/v1/user.routes";

const routes = new Hono();

// V1
routes.basePath("/v1").route("", usersRoutesV1);

export { routes };
