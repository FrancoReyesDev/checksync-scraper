import {Scraper} from './Scraper.js';

export type ScrapersManager = () => {
	scrapers: Scraper[];
};
