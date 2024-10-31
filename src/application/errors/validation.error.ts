import type { ZodError, ZodIssue } from "zod";
import { type DomainError, ErrorCodes } from "~/application/types";

export class ValidationError implements DomainError {
	error = "Validation Error";
	code = ErrorCodes.VALIDATION_ERROR;
	detail: ZodIssue[] | string;

	constructor(errorPayload: ZodError | string) {
		this.detail =
			typeof errorPayload === "string" ? errorPayload : errorPayload.errors;
	}
}
