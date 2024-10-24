import { type DomainError, ErrorCodes } from "~/application/types/domain-error";

export class UnauthorizedError implements DomainError {
	error = "Unauthorized Error";
	code = ErrorCodes.UNAUTHORIZED_ERROR;
	detail: unknown;

	constructor(message?: string) {
		this.detail = { message: message ?? "Unauthorized access" };
	}
}
