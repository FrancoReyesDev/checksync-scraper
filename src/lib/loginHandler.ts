import puppeteer, {Browser} from 'puppeteer';
import {LoginHandler} from 'src/types/Lib';

export const loginHandler = ({
	loggedPathHint,
	loginUrl,
}: {
	loginUrl: string;
	loggedPathHint: string;
}): LoginHandler => {
	let browser: null | Browser = null;

	const login = async () => {
		try {
			if (browser === null) browser = await puppeteer.launch({headless: false}); // Login siempre sera headless false
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
