import { type DomainError, ErrorCodes } from "~/application/types/domain-error";

export class ForbidError implements DomainError {
	error = "Forbid Error";
	code = ErrorCodes.FORBID_ERROR;
	detail: unknown;

	constructor(message: string) {
		this.detail = { message: message ?? "Forbid action" };
	}
}
