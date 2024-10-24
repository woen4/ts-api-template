import * as v from "valibot";
import { type DomainError, ErrorCodes } from "~/application/types/domain-error";

type ValibotIssues = [v.BaseIssue<unknown>, ...v.BaseIssue<unknown>[]];

export class ValidationError implements DomainError {
	error = "Validation Error";
	code = ErrorCodes.VALIDATION_ERROR;
	detail: ReturnType<typeof v.flatten> | string;

	constructor(errorPayload: ValibotIssues | string) {
		this.detail =
			typeof errorPayload === "string" ? errorPayload : v.flatten(errorPayload);
	}
}
