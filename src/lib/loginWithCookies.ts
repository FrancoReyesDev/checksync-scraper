import {Browser, Cookie} from 'puppeteer';

export const loginWithCookies = async ({
	loggedOrigin,
	sessionCookies,
	browser,
}: {
	loggedOrigin: string;
	sessionCookies: Cookie[];
	browser: Browser;
}) => {
	// const browser = await puppeteer.launch({headless: false}); // Cambia a true para ejecución sin interfaz gráfica
	const page = await browser.newPage();

	// Navega a la URL de destino antes de establecer las cookies
	await page.goto(loggedOrigin, {waitUntil: 'networkidle0'});

	// Borra todas las cookies y el almacenamiento local
	const client = await page.createCDPSession();
	await client.send('Network.clearBrowserCookies');
	await client.send('Storage.clearDataForOrigin', {
		origin: loggedOrigin,
		storageTypes: 'all',
	});

	// Establece las cookies guardadas
	await page.setCookie(...(sessionCookies as Cookie[]));

	// Navega a la página de destino con las cookies establecidas
	await page.goto(loggedOrigin, {waitUntil: 'networkidle0'});

	// Recarga la página para aplicar las cookies y el almacenamiento
	await page.reload({waitUntil: 'networkidle0'});

	// // Cierra el navegador
	// await browser.close();
	return page;
};
