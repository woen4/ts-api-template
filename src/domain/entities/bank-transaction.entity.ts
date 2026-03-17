export type BankTransaction = {
	id: string;
	companyId: string;
	externalId: string;
	description: string;
	amount: number;
	date: Date;
	rawJson: Record<string, unknown>;
	createdAt: Date;
};
