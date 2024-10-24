import { type DomainError, ErrorCodes } from "~/application/types/domain-error";

export class DuplicatedEntityError implements DomainError {
	error = "DuplicatedEntity Error";
	code = ErrorCodes.DUPLICATED_ENTITY_ERROR;
	detail: unknown;

	constructor(message: string) {
		this.detail = { message };
	}
}
