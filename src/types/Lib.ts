import {Cookie} from 'puppeteer';

export type LoginHandler = {
	login: () => Promise<{cookies: Cookie[]} | {error: string}>;
	close: () => undefined | Promise<void>;
};

export type LoginClientHandler = {
	login: () => Promise<boolean>;
	close: () => undefined | Promise<void>;
};
