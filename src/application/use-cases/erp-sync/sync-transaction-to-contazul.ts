import { z } from "zod";
import { GenericError } from "~/application/errors/generic.error";
import type { IErpProvider } from "~/application/providers/erp-provider.interface";
import type { IUseCase, IUseCaseResponse } from "~/application/types";
import { Validate, zSafeString } from "~/application/utils";
import { left, right } from "~/core/logic";
import type { ICompanyErpConfigsRepository } from "~/infra/database/repositories/company-erp-configs.repository";
import type { IErpSyncLogsRepository } from "~/infra/database/repositories/erp-sync-logs.repository";

const schema = z.object({
	companyId: zSafeString(z.string().uuid()),
	transaction: z.object({
		id: z.string().uuid(),
		companyId: z.string().uuid(),
		externalId: z.string(),
		description: z.string(),
		amount: z.number(),
		date: z.coerce.date(),
		rawJson: z.record(z.string(), z.unknown()),
		createdAt: z.coerce.date(),
	}),
});

export type SyncTransactionToContaAzulRequest = z.infer<typeof schema>;

export type SyncTransactionToContaAzulResponse = IUseCaseResponse<{
	syncLogId: string;
}>;

export class SyncTransactionToContaAzulUseCase
	implements IUseCase<SyncTransactionToContaAzulResponse>
{
	constructor(
		private readonly contaAzulProvider: IErpProvider,
		private readonly companyErpConfigsRepository: ICompanyErpConfigsRepository,
		private readonly erpSyncLogsRepository: IErpSyncLogsRepository,
	) {}

	@Validate(schema)
	async handle(data: SyncTransactionToContaAzulRequest) {
		const config =
			await this.companyErpConfigsRepository.findByCompanyAndSlug(
				data.companyId,
				"contazul",
			);

		if (!config) {
			return left(
				new GenericError({
					message: "ContaAzul config not found for this company",
				}),
			);
		}

		const syncLog = await this.erpSyncLogsRepository.create({
			erpProviderId: config.erpProviderId,
			referenceId: data.transaction.id,
			referenceType: "transaction",
			syncStatus: "pending",
			erpResponse: null,
			syncedAt: null,
		});

		const result = await this.contaAzulProvider.syncTransaction(
			data.transaction,
			config,
		);

		if (result.isLeft()) {
			await this.erpSyncLogsRepository.updateStatus(
				syncLog.id,
				"error",
				JSON.stringify(result.value),
			);
			return left(result.value);
		}

		await this.erpSyncLogsRepository.updateStatus(
			syncLog.id,
			"success",
			result.value.rawResponse,
		);

		return right({
			message: "Transaction synced to ContaAzul successfully",
			detail: { syncLogId: syncLog.id },
		});
	}
}
