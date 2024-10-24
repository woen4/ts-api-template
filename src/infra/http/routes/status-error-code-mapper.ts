import { ErrorCodes } from "~/application/types/domain-error";

export const StatusErrorCodeMapper = (errorCode: ErrorCodes) => {
	switch (errorCode) {
		case ErrorCodes.VALIDATION_ERROR:
			return 422;
		case ErrorCodes.NOT_FOUND_ERROR:
			return 404;
		case ErrorCodes.DUPLICATED_ENTITY_ERROR:
			return 409;
		case ErrorCodes.GENERIC_ERROR:
			return 400;
		case ErrorCodes.UNAUTHORIZED_ERROR:
			return 401;
		default:
			return 500;
	}
};
