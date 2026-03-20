import fs from "node:fs";
import path from "node:path";
import { Page } from "playwright";

/**
 * Helper to handle file downloads in Playwright. Listens for the download event,
 * saves the file to a specified directory, and returns the file path.
 * @param page Playwright page instance to listen for download events
 * @param customFileName Filename optional (ex: 'extrato-itau-março.pdf')
 * @returns The path to the saved file
 */
export async function handleDownload(page: Page, customFileName?: string): Promise<string> {
	const downloadPromise = page.waitForEvent('download');

	console.log("⏳ Listen the download event...");

	const download = await downloadPromise;

	const downloadsDir = path.join(process.cwd(), 'downloads');

	if (!fs.existsSync(downloadsDir)) {
		fs.mkdirSync(downloadsDir, { recursive: true });
	}

	const fileName = customFileName || download.suggestedFilename();
	const filePath = path.join(downloadsDir, fileName);

	await download.saveAs(filePath);

	console.log(`✅ File saved successfully: ${filePath}`);

	// TODO: determine where the file should be saved
	return filePath;
}