import { type TenantId, toTenantId, toUserId, type UserId } from "~/domain/ids";

export type AuthContext = {
	userId: UserId;
	tenantId?: TenantId;
};

export type RequestContext = {
	auth: AuthContext | null;
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
	return typeof value === "object" && value !== null;
};

export const toRequestContext = (authPayload: unknown): RequestContext => {
	if (!isRecord(authPayload) || typeof authPayload.userId !== "string") {
		return { auth: null };
	}

	return {
		auth: {
			userId: toUserId(authPayload.userId),
			tenantId:
				typeof authPayload.tenantId === "string"
					? toTenantId(authPayload.tenantId)
					: undefined,
		},
	};
};
