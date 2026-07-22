import type { Brand } from "~/core/types/brand";

export type UserId = Brand<string, "UserId">;
export type PostId = Brand<string, "PostId">;
export type TenantId = Brand<string, "TenantId">;

export const toUserId = (value: string): UserId => value as UserId;

export const toPostId = (value: string): PostId => value as PostId;

export const toTenantId = (value: string): TenantId => value as TenantId;
