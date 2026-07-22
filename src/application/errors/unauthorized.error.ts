import { type DomainError, ErrorCodes } from "~/application/types/domain-error";

type UnauthorizedErrorDetail = {
	message: string;
};

export class UnauthorizedError implements DomainError<UnauthorizedErrorDetail> {
	error = "Unauthorized Error";
	code = ErrorCodes.UNAUTHORIZED_ERROR;
	detail: UnauthorizedErrorDetail;

	constructor(message?: string) {
		this.detail = { message: message ?? "Unauthorized access" };
	}
}
