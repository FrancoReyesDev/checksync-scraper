import {Cookie} from 'puppeteer';
import {ScraperConfig} from 'checksync-scraper/types/ScraperConfig.js';

export class Scraper<C extends ScraperConfig, Movement> {
	config: C;
	status: any;
	sessionCookies: Cookie[];
	login: (sessionCookies: Cookie[]) => void;
	logout: () => void;
	start: () => void;
	pause: () => void;
	getMovements: () => Movement[];
	setMovements: (movement: Movement[]) => void;
}
