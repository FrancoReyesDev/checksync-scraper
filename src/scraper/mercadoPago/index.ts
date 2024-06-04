import {Browser} from 'puppeteer';
import {MercadoPagoScraper, Movement} from './types';

export const mercadoPagoScraper: MercadoPagoScraper = () => {
	const config: ReturnType<MercadoPagoScraper>['config'] = {
		color: '',
		loginUrl: 'https://www.mercadolibre.com/jms/mla/lgz/login?platform_id=MP',
		loggedOrigin: 'https://www.mercadopago.com.ar',
		loggedInPathHint: 'home',
		scrap: {
			frequency: 1800000,
			startFromId: '75279230369',
			maxPage: 10,
		},
	};

	const status: ReturnType<MercadoPagoScraper>['status'] = {
		isLoggedIn: false,
		isWorking: false,
	};

	let sessionCookies: ReturnType<MercadoPagoScraper>['sessionCookies'] = [];

	const login: ReturnType<MercadoPagoScraper>['login'] =
		async newSessionCookies => {
			sessionCookies = newSessionCookies;
			status.isLoggedIn = true;
		};

	const logout = () => {
		sessionCookies = [];
		status.isLoggedIn = false;
	};

	let workingInterval: NodeJS.Timeout | null = null;
	let browser: Browser | null = null;

	const start = () => {
		if (workingInterval !== null || browser !== null) finish();
		workingInterval = setInterval(() => {}, config.scrap.frequency);
	};

	const finish = () => {
		if (workingInterval === null && browser === null) return;

		clearTimeout(workingInterval as NodeJS.Timeout);
		browser = null;
	};

	const getMovements = () => [];
	const setMovements = (movements: Movement[]) => {};

	return {
		config,
		status,
		sessionCookies,
		login,
		logout,
		start,
		finish,
		setMovements,
		getMovements,
	};
};
