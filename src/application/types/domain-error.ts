export enum ErrorCodes {
	VALIDATION_ERROR = 0,
	NOT_FOUND_ERROR = 1,
	DUPLICATED_ENTITY_ERROR = 2,
	GENERIC_ERROR = 3,
	UNAUTHORIZED_ERROR = 4,
	FORBID_ERROR = 5,
}

export interface DomainError {
	error: string;
	code: ErrorCodes;
}
