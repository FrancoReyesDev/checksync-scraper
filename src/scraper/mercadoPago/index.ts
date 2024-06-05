import puppeteer, {Browser, Cookie} from 'puppeteer';
import {MercadoPagoScraper} from './types';
import {runner} from './runner';
import {loginWithCookies} from 'src/lib/loginWithCookies';
import {loginHandler} from 'src/lib/loginHandler';

export const mercadoPagoScraper: MercadoPagoScraper = ({
	findMovement,
	setMovements,
}) => {
	const config = {
		name: 'mercado pago',
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

	let workingInterval: NodeJS.Timeout | null = null;
	let browser: Browser | null = null;

	const status = {
		isLoggedIn: false,
		isWorking: false,
	};

	let sessionCookies: Cookie[] = [];

	const loginClientHandler: ReturnType<MercadoPagoScraper>['loginClientHandler'] =
		() => {
			const {login, close} = loginHandler({
				loggedPathHint: config.loggedInPathHint,
				loginUrl: config.loginUrl,
			});

			const handleLogin = async () => {
				const loginAttempt = await login();
				if ('cookies' in loginAttempt) {
					sessionCookies = loginAttempt.cookies;
					return true;
				}
				return false;
			};

			return {login: handleLogin, close};
		};

	const login: ReturnType<MercadoPagoScraper>['login'] =
		async newSessionCookies => {
			sessionCookies = newSessionCookies;
			status.isLoggedIn = true;
		};

	const start = () => {
		if (
			status.isLoggedIn === false ||
			workingInterval !== null ||
			browser !== null
		)
			finish();
		workingInterval = setInterval(scrap, config.scrap.frequency);
	};

	const logout = () => {
		sessionCookies = [];
		status.isLoggedIn = false;
	};

	const scrap = async (visible: boolean = false) => {
		if (sessionCookies.length === 0) return;

		if (browser === null)
			browser = await puppeteer.launch({headless: !visible});
		const page = await loginWithCookies({
			loggedOrigin: config.loggedOrigin,
			sessionCookies,
			browser,
		});
		const movements = await runner({
			page,
			browser,
			findMovement,
			startFromId: config.scrap.startFromId,
			maxPage: config.scrap.maxPage,
		});
	};

	const finish = () => {
		if (
			status.isLoggedIn === false ||
			(workingInterval === null && browser === null)
		)
			return;

		clearTimeout(workingInterval as NodeJS.Timeout);
		browser = null;
	};

	const getConfig = () => config;
	const getStatus = () => status;
	const getSessionCookies = () => sessionCookies;

	return {
		getConfig,
		getStatus,
		getSessionCookies,
		login,
		loginClientHandler,
		logout,
		start,
		finish,
		scrap,
	};
};
