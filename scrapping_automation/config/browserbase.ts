import 'dotenv/config';
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const browserbaseConfig = {
	apiKey: process.env.BROWSERBASE_API_KEY,
	projectId: process.env.BROWSERBASE_PROJECT_ID,
};

if (!browserbaseConfig.apiKey) {
	throw new Error("❌ CRITICAL: BROWSERBASE_API_KEY is missing in environment variables.");
}

if (!browserbaseConfig.projectId) {
	throw new Error("❌ CRITICAL: BROWSERBASE_PROJECT_ID is missing in environment variables.");
}