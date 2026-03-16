import type { PrismaClient } from "@prisma/client";
import type { ErpSyncLog, ErpSyncLogStatus } from "~/domain/entities";

export type IErpSyncLogsRepository = ErpSyncLogsRepository;

export class ErpSyncLogsRepository {
	static usedAs = "erpSyncLogsRepository";

	constructor(private readonly prisma: PrismaClient) {}

	create(data: Omit<ErpSyncLog, "id">) {
		return this.prisma.erpSyncLog.create({ data });
	}

	updateStatus(id: string, syncStatus: ErpSyncLogStatus, erpResponse?: string) {
		return this.prisma.erpSyncLog.update({
			where: { id },
			data: { syncStatus, erpResponse, syncedAt: new Date() },
		});
	}
}
