import { Hono } from "hono";
import { diContainer } from "~/infra/di-container";
import { defaultHandler } from "~/infra/http/routes/default-handler";

export const erpSyncRoutesV1 = new Hono().basePath("/erp-sync");

erpSyncRoutesV1.post(
	"/contazul/transaction",
	defaultHandler(diContainer.cradle.SyncTransactionToContaAzulUseCase),
);
