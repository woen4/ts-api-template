import { type DomainError, ErrorCodes } from "~/application/types/domain-error";

type ForbidErrorDetail = {
	message: string;
};

export class ForbidError implements DomainError<ForbidErrorDetail> {
	error = "Forbid Error";
	code = ErrorCodes.FORBID_ERROR;
	detail: ForbidErrorDetail;

	constructor(message: string) {
		this.detail = { message: message ?? "Forbid action" };
	}
}
