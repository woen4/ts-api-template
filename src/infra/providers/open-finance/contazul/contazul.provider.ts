import { GenericError } from "~/application/errors/generic.error";
import type { IErpProvider, ErpSyncResult } from "~/application/providers/erp-provider.interface";
import type { DomainError } from "~/application/types";
import { left, right } from "~/core/logic";
import type { AsyncEither } from "~/core/logic";
import type { BankTransaction, CompanyErpConfig } from "~/domain/entities";

export class ContaAzulProvider implements IErpProvider {
	static usedAs = "contaAzulProvider";

	readonly slug = "contazul";

	async syncTransaction(
		transaction: BankTransaction,
		config: CompanyErpConfig,
	): AsyncEither<DomainError, ErpSyncResult> {
		try {
			const response = await fetch(
				`${config.endpointUrl}/financeiro/lancamentos`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${config.externalApiKey}`,
					},
					body: JSON.stringify({
						descricao: transaction.description,
						valor: Number(transaction.amount),
						data: transaction.date,
						idExterno: transaction.externalId,
					}),
				},
			);

			const body = await response.text();

			if (!response.ok) {
				return left(
					new GenericError({
						message: "ContaAzul sync failed",
						response: body,
					}),
				);
			}

			return right({ externalId: transaction.externalId, rawResponse: body });
		} catch (error) {
			return left(new GenericError(error));
		}
	}
}
