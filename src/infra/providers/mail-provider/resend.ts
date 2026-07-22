import type { IMailProvider } from "~/infra/providers/mail-provider";

import type { MailAddress, SendMailInput, SendMailOutput } from "./index";

const toArray = (value: MailAddress | undefined) => {
	if (!value) {
		return undefined;
	}

	return Array.isArray(value) ? value : [value];
};

type ResendSuccessResponse = {
	id: string;
};

type ResendErrorResponse = {
	message?: string;
	name?: string;
};

export class ResendMailProvider implements IMailProvider {
	static usedAs = "mailProvider";

	async send(input: SendMailInput): Promise<SendMailOutput> {
		if (!input.html && !input.text) {
			throw new Error("Resend mail requires html or text content");
		}

		const apiKey = process.env.RESEND_API_KEY;

		if (!apiKey) {
			throw new Error("Missing RESEND_API_KEY");
		}

		const response = await fetch("https://api.resend.com/emails", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${apiKey}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				from: input.from,
				to: toArray(input.to),
				subject: input.subject,
				html: input.html,
				text: input.text,
				cc: toArray(input.cc),
				bcc: toArray(input.bcc),
				reply_to: toArray(input.replyTo),
				tags: input.tags,
			}),
		});

		if (!response.ok) {
			const errorPayload =
				((await response
					.json()
					.catch(() => null)) as ResendErrorResponse | null) ?? null;
			const message =
				errorPayload?.message ??
				errorPayload?.name ??
				`Resend request failed with status ${response.status}`;

			throw new Error(message);
		}

		const payload = (await response.json()) as ResendSuccessResponse;

		return {
			id: payload.id,
		};
	}
}
