import {ScraperDependencies, ScraperFactory} from 'src/types/ScraperFactory';
import {ScraperConfig} from 'src/types/ScraperConfig';

export type Movement = {
	url: string;
	date: string;
	amount: number;
};

export interface DetailedMovement extends Movement {
	status: string | undefined;
	userName: string | undefined;
	userDetails: Record<string, string | number | (string | number)[]>;
	type: string | undefined;
	id: string;
	link: string;
	date: string;
}

export type MercadoPagoScraperDependencies = ScraperDependencies<
	Movement | DetailedMovement
>;

export type MercadoPagoScraper = ScraperFactory<
	ScraperConfig,
	MercadoPagoScraperDependencies
>;
