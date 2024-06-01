import config from 'checksync-scraper/config.json';
import {z} from 'zod';

const configSchema = z.object({
	server: z.object({
		url: z.string(),
		port: z.number(),
	}),
	accounts: z.array(
		z.object({
			id: z.string(),
			color: z.string().optional(),
			loginUrl: z.string(),
			loggedInPathHint: z.string(),
			loggedOrigin: z.string(),
			scrap: z.object({
				frequency: z.number(),
				steps: z.string(),
				startFromId: z.string(),
				maxPage: z.number(),
			}),
		}),
	),
});

export const isValidConfig = () => {
	try {
		configSchema.parse(config);
		return true;
	} catch {
		return false;
	}
};
