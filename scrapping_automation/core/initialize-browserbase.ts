import {chromium, BrowserContext, devices, BrowserContextOptions, Browser} from "playwright";
import { browserbaseConfig } from "../config/browserbase";

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

	async createSession()
	{
		// const browser = await chromium.connectOverCDP(
		// 	`wss://connect.browserbase.com?apiKey=${browserbaseConfig.apiKey}&projectId=${browserbaseConfig.projectId}`
		// ) as BrowserbaseSession;

		const browser = await chromium.launch({
			headless: false, // O Warsaw às vezes exige que o browser seja visível (Janela aberta)
			executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
		}) as BrowserbaseSession;

		const iPad = devices['Desktop Chrome']; // iPad Pro 11, iPhone 13

		const { defaultBrowserType, ...deviceOptions } = iPad;

		const contextOptions: BrowserContextOptions = {
			...deviceOptions,
			userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
			viewport: { width: 1920, height: 1080 },
			locale: 'pt-BR',
			timezoneId: 'America/Sao_Paulo',
		};

		const context = await browser.newContext(contextOptions);

		await this.applyStealth(context);

		const page = await context.newPage();

		const sessionId = browser.sessionId || 'LOCAL_SESSION';
		console.log(`🚀 SESSION STARTED AT: https://www.browserbase.com/sessions/${sessionId}`);

		browser.on('disconnected', () => {
			console.error('⚠️ Browser desconectado — sessão possivelmente expirada ou conexão perdida.');
		});

		return { browser, context, page, sessionId };
	}

	private async applyStealth(context: BrowserContext) {
		await context.addInitScript(() => {
			Object.defineProperty(navigator, 'platform', { get: () => 'Win32' });

			// @ts-ignore
			window.chrome = {
				runtime: {},
				loadTimes: Date.now,
				csiex: function() {},
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