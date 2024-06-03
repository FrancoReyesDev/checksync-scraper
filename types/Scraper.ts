import {Cookie} from 'puppeteer';
import {ScraperConfig} from './ScraperConfig.js';

export type Scraper<C extends ScraperConfig, Movement> = {
	config: C;
	status: {
		isWorking: boolean;
		isLoggedIn: boolean;
	};
	sessionCookies: Cookie[];
	login: (sessionCookies: Cookie[]) => void;
	logout: () => void;
	start: () => void;
	finish: () => void;
	getMovements: () => Movement[];
	setMovements: (movement: Movement[]) => void;
};
