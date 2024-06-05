export type ScraperConfig = {
	name: string;
	color?: string;
	loginUrl: string;
	loggedOrigin: string;
	loggedInPathHint: string;
	scrap: {
		frequency: number;
		startFromId: string; // Fecha en dd/mm/yyyy
		maxPage: number;
	};
};
