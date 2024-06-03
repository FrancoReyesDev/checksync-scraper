import {Scraper} from 'checksync-scraper/types/Scraper';
import {ScraperConfig} from 'checksync-scraper/types/ScraperConfig';

export type Config = ScraperConfig;

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

export type MercadoPagoScraper = Scraper<Config, DetailedMovement>;
