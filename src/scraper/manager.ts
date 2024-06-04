import {Manager as ManagerType} from 'src/types/Manager';
import {mercadoPagoScraper} from './mercadoPago';
import {Scraper} from 'src/types/Scraper';
import {ScraperConfig} from 'src/types/ScraperConfig';

export const Manager: ManagerType = () => {
	const scrapers: {[name: string]: Scraper<ScraperConfig, any>} = {
		mp: mercadoPagoScraper,
	};

	const initScrapers = () => {
		return Object.entries(scrapers).reduce((acc, [name, scraper]) => {
			acc[name] = scraper();
			return acc;
		}, {} as ReturnType<ManagerType>['scrapers']);
	};

	return {scrapers: initScrapers()};
};
