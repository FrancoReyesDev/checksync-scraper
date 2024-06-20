import {Cookie} from 'puppeteer';
import {ScraperConfig} from './ScraperConfig';
import {LaunchLogin} from './Lib';
import {ScraperStatus} from './ScraperStatus';

export type ScraperDependencies<M, F> = {
	findMovement: (movement: M) => Promise<M | null>;
	setMovements: (movements: M[]) => Promise<void>;
	setFailedAttempts: (faileds: F[]) => Promise<void>;
};

export type ScraperFactory<C extends ScraperConfig, Dependencies> = (
	dependencies: Dependencies,
) => {
	getConfig: () => C;
	getStatus: () => ScraperStatus;

	login: (sessionCookies: Cookie[]) =>
		| {
				error: string;
		  }
		| {
				success: string;
		  };

	logout: () => void;
	start: () => void;
	finish: () => void;
	scrap: () => void;
	launchLogin: () => ReturnType<LaunchLogin>;
};
