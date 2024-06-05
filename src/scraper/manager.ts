import {
	Manager,
	ManagerScrapersDependencies,
	Scrapers,
} from 'src/types/Manager';

import {mercadoPagoScraper} from './mercadoPago/index';

export const manager: Manager = dependencies => {
	const scrapers = {
		mp: mercadoPagoScraper,
	};

	const initScrapers = () => {
		return Object.entries(scrapers).reduce((acc, [name, scraper]) => {
			acc[name as keyof Scrapers] = scraper(
				dependencies[name as keyof ManagerScrapersDependencies],
			);
			return acc;
		}, {} as Scrapers);
	};

	return {scrapers: initScrapers()};
};
