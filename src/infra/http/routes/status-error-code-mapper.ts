import { ErrorCodes } from "~/application/types/domain-error";
import { match } from "~/core/logic";

/**
 * Único ponto do sistema que traduz erro de domínio em status HTTP.
 *
 * O `.exhaustive()` garante em tempo de compilação que todo `ErrorCodes` tem
 * status: adicionar um membro novo ao enum quebra o build aqui até ser tratado.
 */
export const StatusErrorCodeMapper = (errorCode: ErrorCodes) => {
	return match(errorCode)
		.with(ErrorCodes.VALIDATION_ERROR, () => 422 as const)
		.with(ErrorCodes.NOT_FOUND_ERROR, () => 404 as const)
		.with(ErrorCodes.DUPLICATED_ENTITY_ERROR, () => 409 as const)
		.with(ErrorCodes.GENERIC_ERROR, () => 400 as const)
		.with(ErrorCodes.UNAUTHORIZED_ERROR, () => 401 as const)
		.with(ErrorCodes.FORBID_ERROR, () => 403 as const)
		.exhaustive();
};
