import type { DomainError } from "~/application/types";
import type { AsyncEither } from "~/core/logic";
import type { BankTransaction, CompanyErpConfig } from "~/domain/entities";

export type ErpSyncResult = {
	externalId: string;
	rawResponse: string;
};

export interface IErpProvider {
	readonly slug: string;
	syncTransaction(
		transaction: BankTransaction,
		config: CompanyErpConfig,
	): AsyncEither<DomainError, ErpSyncResult>;
}
