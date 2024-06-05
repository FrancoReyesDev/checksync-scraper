import {
	MercadoPagoScraper,
	MercadoPagoScraperDependencies,
} from 'src/scraper/mercadoPago/types';

type ManagerScrapers = {mp: MercadoPagoScraper};

export type ManagerScrapersDependencies = {
	mp: MercadoPagoScraperDependencies;
};

type ManagerScrapersInitializedReturn = {
	[key in keyof ManagerScrapers]: ReturnType<ManagerScrapers[key]>;
};

export type Scraper =
	ReturnType<Manager>['scrapers'][keyof ReturnType<Manager>['scrapers']];

export type Scrapers = ReturnType<Manager>['scrapers'];

export type Manager = (dependencies: ManagerScrapersDependencies) => {
	scrapers: ManagerScrapersInitializedReturn;
};
