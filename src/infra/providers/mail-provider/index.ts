export type MailAddress = string | string[];

export type MailTag = {
	name: string;
	value: string;
};

export type SendMailInput = {
	from: string;
	to: MailAddress;
	subject: string;
	html?: string;
	text?: string;
	cc?: MailAddress;
	bcc?: MailAddress;
	replyTo?: MailAddress;
	tags?: MailTag[];
};

export type SendMailOutput = {
	id: string;
};

export interface IMailProvider {
	send(input: SendMailInput): Promise<SendMailOutput>;
}

export * from "./resend";
