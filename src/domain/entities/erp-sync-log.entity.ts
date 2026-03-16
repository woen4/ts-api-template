export type ErpSyncLogStatus = "pending" | "success" | "error";
export type ErpSyncLogReferenceType = "statement" | "transaction";

export type ErpSyncLog = {
	id: string;
	erpProviderId: number;
	referenceId: string;
	referenceType: ErpSyncLogReferenceType;
	syncStatus: ErpSyncLogStatus;
	erpResponse?: string | null;
	syncedAt?: Date | null;
};
