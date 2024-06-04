import puppeteer, {Browser, Cookie} from 'puppeteer';

export type LoginHandler = {
	login: () => Promise<{cookies: Cookie[]} | {error: string}>;
	close: () => undefined | Promise<void>;
};

export const loginHandler = async (
	loginUrl: string,
	loggedPathHint: string,
): Promise<LoginHandler> => {
	let browser: null | Browser = null;

	const login = async () => {
		try {
			if (browser === null) browser = await puppeteer.launch({headless: false}); // Cambia a true para ejecución sin interfaz gráfica
			const page = await browser.newPage();
			await page.goto(loginUrl);

			// Inicia sesión manualmente en el navegador controlado por Puppeteer
			// Espera hasta que se cambie a la página /home
			const fiveMinutesMs = 1000 * 5 * 60;
			await page.waitForRequest(
				req => {
					return req.url().includes(loggedPathHint);
				},
				{timeout: fiveMinutesMs},
			);

			// Obtiene las cookies al estar en la página /home
			const cookies = await page.cookies();

			// Cierra el navegador
			await browser.close();
			return {cookies};
		} catch (e) {
			if (browser !== null) browser.close();
			console.error(e);
			return {error: 'error de login'};
		}
	};

	const close = () => {
		if (browser === null) return undefined;
		browser.close();
		browser = null;
	};

	return {login, close};
};
