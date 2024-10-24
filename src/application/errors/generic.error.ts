import { type DomainError, ErrorCodes } from "~/application/types/domain-error";

export class GenericError implements DomainError {
	error = "Generic Error";
	code = ErrorCodes.GENERIC_ERROR;
	detail: unknown;

	constructor(detail: unknown) {
		this.detail = detail;
	}
}
