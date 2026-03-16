export type CompanyErpConfig = {
	id: string;
	companyId: string;
	erpProviderId: number;
	externalApiKey: string;
	endpointUrl: string;
	settings: Record<string, unknown>;
};
