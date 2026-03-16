import { Hono } from "hono";
import { erpSyncRoutesV1 } from "~/infra/http/routes/v1/erp-sync.routes";
import { usersRoutesV1 } from "~/infra/http/routes/v1/user.routes";

const routes = new Hono();

// V1
routes.basePath("/v1").route("", usersRoutesV1);
routes.basePath("/v1").route("", erpSyncRoutesV1);

export { routes };
