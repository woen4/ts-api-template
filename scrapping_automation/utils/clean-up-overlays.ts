import { Page } from "@browserbasehq/stagehand";

export async function clearOverlays(page: Page) {
	const overlays = ['itau-cookie-consent-banner', '.ids-modal', '.ids-overlay'];

	for (const selector of overlays) {
		await page.evaluate((sel) => {
			document.querySelector(sel)?.remove();
		}, selector);
	}
}