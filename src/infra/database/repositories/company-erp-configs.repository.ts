import type { PrismaClient } from "@prisma/client";
import type { CompanyErpConfig } from "~/domain/entities";
import type { ExtendedModel } from "~/infra/database/repositories/types";

export type ICompanyErpConfigsRepository = CompanyErpConfigsRepository;

export class CompanyErpConfigsRepository {
	static usedAs = "companyErpConfigsRepository";

	constructor(private readonly prisma: PrismaClient) {}

	async findByCompanyAndSlug(
		companyId: string,
		slug: string,
	): Promise<CompanyErpConfig | null> {
		const record = await this.prisma.companyErpConfig.findFirst({
			where: { companyId, erpProvider: { slug } },
		});

		if (!record) return null;

		return CompanyErpConfigsRepository.toDomain(record);
	}

	static toDomain(record: ExtendedModel<"companyErpConfig">): CompanyErpConfig {
		return {
			...record,
			settings: record.settings as Record<string, unknown>,
		};
	}
}
