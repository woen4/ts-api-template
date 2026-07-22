import { type DomainError, ErrorCodes } from "~/application/types/domain-error";

export type GenericErrorDetail =
	| string
	| number
	| boolean
	| null
	| Record<string, string | number | boolean | null>;

export class GenericError implements DomainError<GenericErrorDetail> {
	error = "Generic Error";
	code = ErrorCodes.GENERIC_ERROR;
	detail: GenericErrorDetail;

	constructor(detail: GenericErrorDetail) {
		this.detail = detail;
	}
}
