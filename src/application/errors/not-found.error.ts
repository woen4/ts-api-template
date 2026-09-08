import { type DomainError, ErrorCodes } from "~/application/types/domain-error";

export type NotFoundErrorDetail = string;

export class NotFoundError implements DomainError<NotFoundErrorDetail> {
	error = "NotFound Error";
	code = ErrorCodes.NOT_FOUND_ERROR;
	detail: NotFoundErrorDetail;

	constructor(detail: NotFoundErrorDetail) {
		this.detail = detail;
	}
}
