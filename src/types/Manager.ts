import {Scraper} from './Scraper.js';
import {ScraperConfig} from './ScraperConfig.js';

export type Manager = () => {
	scrapers: Record<string, ReturnType<Scraper<ScraperConfig, any>>>;
};
