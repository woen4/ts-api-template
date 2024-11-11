import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";
import { secureHeaders } from "hono/secure-headers";

import { routes } from "~/infra/http/routes";

export const app: Hono = new Hono({}).route("/api", routes);

app.use(
	cors({
		origin: "*",
		credentials: true,
		allowMethods: ["GET", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
		allowHeaders: [
			"Origin",
			"X-Requested-With",
			"Accept",
			"Content-Type",
			"Authorization",
		],
		exposeHeaders: [
			"Access-Control-Allow-Origin",
			"Access-Control-Allow-Methods",
			"Access-Control-Allow-Headers",
		],
	}),
);

app.use(bodyLimit({ maxSize: 100 * 1024 })); // Size in bytes, 100kb

app.use(secureHeaders());

app.use(
	csrf({
		// Put the origin of the app here
		origin: ["myapp.example.com", "http://localhost:3333"],
	}),
);

// Only for unhandled errors
app.onError((error, c) => {
	console.error(error);
	return c.text("Internal server error", 500);
});
