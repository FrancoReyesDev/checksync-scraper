export type ScraperConfig = {
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
