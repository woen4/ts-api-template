import { showRoutes } from "hono/dev";

import { serve } from "@hono/node-server";
import { app } from "~/infra";

showRoutes(app);
serve({ fetch: app.fetch, port: 3333 });
