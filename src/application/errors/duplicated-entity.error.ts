import { type DomainError, ErrorCodes } from "~/application/types/domain-error";

type DuplicatedEntityErrorDetail = {
	message: string;
};

export class DuplicatedEntityError
	implements DomainError<DuplicatedEntityErrorDetail>
{
	error = "DuplicatedEntity Error";
	code = ErrorCodes.DUPLICATED_ENTITY_ERROR;
	detail: DuplicatedEntityErrorDetail;

	constructor(message: string) {
		this.detail = { message };
	}
}
