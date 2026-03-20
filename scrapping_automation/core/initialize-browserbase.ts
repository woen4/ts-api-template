import {chromium, BrowserContext, devices, Browser} from "playwright";

interface BrowserbaseSession extends Browser {
	sessionId: string;
}

export class BrowserService {
	private static instance: BrowserService

	private constructor() {}

	public static getInstance(): BrowserService
	{
		if (!BrowserService.instance) {
			BrowserService.instance = new BrowserService();
			console.log("✅ BrowserService instance created.");
		}

		return BrowserService.instance;
	}

	async createSession(useBrowserbase = true)
	{
		let browser, context, sessionId = 'local-session';

		if (useBrowserbase) {
			browser = await chromium.connectOverCDP(
				`wss://connect.browserbase.com?apiKey=${browserbaseConfig.apiKey}&projectId=${browserbaseConfig.projectId}`
			) as BrowserbaseSession;

			sessionId = browser.sessionId;

			console.log(`🚀 SESSION STARTED AT: https://www.browserbase.com/sessions/${sessionId}`);

			const desktopDevice = devices['Desktop Chrome'];

			const { defaultBrowserType, ...deviceOptions } = desktopDevice;

			const contextOptions: BrowserContextOptions = {
				...deviceOptions,
				userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
				viewport: { width: 1920, height: 1080 },
				locale: 'pt-BR',
				timezoneId: 'America/Sao_Paulo',
			};

			context = await browser.newContext(contextOptions);

			await this.applyStealth(context);
		} else {
			browser = await chromium.launch({
				headless: false,
				executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
			}) as BrowserbaseSession;

			console.log(`🚀 LOCAL SESSION STARTED ON WINDOWS SERVER`);

			context = await browser.newContext({
				viewport: { width: 1920, height: 1080 }
			});
		}

		const page = await context.newPage();

		return {
			browser,
			context,
			page,
			sessionId,
		};
	}

	private async applyStealth(context: BrowserContext) {
		await context.addInitScript(() => {
			Object.defineProperty(navigator, 'platform', { get: () => 'Win32' });

			// @ts-ignore
			window.chrome = {
				runtime: {},
				loadTimes: Date.now,
				app: {}
			};

			// @ts-ignore
			navigator.deviceMemory = 8;

			Object.defineProperty(navigator, 'languages', { get: () => ['pt-BR', 'pt'] });
			Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 });
			Object.defineProperty(navigator, 'webdriver', { get: () => false });

			// @ts-ignore
			const originalGetContext = HTMLCanvasElement.prototype.getContext;

			HTMLCanvasElement.prototype.getContext = function(type) {
				return originalGetContext.apply(this, arguments);
			};
		});
	}
}