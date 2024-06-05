import {Cookie} from 'puppeteer';
import {ScraperConfig} from './ScraperConfig';
import {LoginClientHandler} from './Lib';

export type ScraperDependencies<M> = {
	findMovement: (movement: M) => M | undefined;
	setMovements: (Movements: M[]) => void;
};

export type ScraperFactory<C extends ScraperConfig, Dependencies> = (
	dependencies: Dependencies,
) => {
	getConfig: () => C;
	getStatus: () => {
		isWorking: boolean;
		isLoggedIn: boolean;
	};
	getSessionCookies: () => Cookie[];
	login: (sessionCookies: Cookie[]) => void;
	logout: () => void;
	start: () => void;
	finish: () => void;
	scrap: (visible: boolean) => Promise<void>;
	loginClientHandler: () => LoginClientHandler;
};
