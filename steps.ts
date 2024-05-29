import {Browser, Page} from 'puppeteer';

type DetailedMovement = {
	status: string | null | undefined;
	user: string | null;
	userDetails: Record<string, string | number | (string | number)[]>;
	type: string | null;
	movementId: string;
	link: string;
	date: string | null;
	amount: number;
};

const mpSteps = async ({page, browser}: {page: Page; browser: Browser}) => {
	await page.goto(
		'https://www.mercadopago.com.ar/activities#from-section=home',
		{waitUntil: 'networkidle0'},
	);

	const movements = await page.$$eval('a.ui-row__link', movement =>
		movement
			.filter(
				a =>
					a.getElementsByClassName('andes-money-amount__negative-symbol')[0] ===
					undefined,
			)
			.map(a => {
				const link = a.href;
				const date = a.getElementsByTagName('time')[0]!.textContent;
				const amount =
					a
						.getElementsByClassName('andes-money-amount__fraction')[0]!
						.textContent!.replaceAll('.', '') +
					'.' +
					a.getElementsByClassName('andes-money-amount__cents')[0]!.textContent;
				return {link, date, amount: Number(amount)};
			}),
	);

	const detailedMovemetsPromises = movements.map(async movement => {
		const page = await browser.newPage();
		await page.goto(movement.link, {waitUntil: 'networkidle0'});

		let statusDoesntExist = false;

		await Promise.all([
			page.waitForSelector('span.c-copy-operation__text--initial', {
				timeout: 5000,
			}),
			page.waitForSelector('div.ticket-v2-row__title', {timeout: 5000}),
			page
				.waitForSelector('div.andes-message__content', {timeout: 5000})
				.catch(() => (statusDoesntExist = true)),
			page.waitForSelector('li.user-info-v2__name', {timeout: 5000}),
			page.waitForSelector('li.user-info-v2__detail', {timeout: 5000}),
		]);

		const [movementId, type, status, user, userDetails] = await Promise.all([
			page.$eval(
				// Movement Id
				'span.c-copy-operation__text--initial',
				span => span.textContent!.match(/\d+/g)![0].trim(),
			),
			page.$eval('div.ticket-v2-row__title', div => div.textContent),
			statusDoesntExist
				? undefined
				: page.$eval('div.andes-message__content', div => div.textContent),
			page.$eval('li.user-info-v2__name', li => li.textContent),
			page.$$eval(
				'li.user-info-v2__detail',
				(
					lis, //Details
				) =>
					lis.reduce((acc, li) => {
						const text = li.textContent;
						if (text === null) return acc;

						if (text.includes('CUIT/CUIL'))
							acc['CUIT/CUIL'] =
								text.match(/\d+/g) !== null
									? text.match(/\d+/g)![0].trim()
									: 'error';
						else if (text.includes('CVU'))
							acc['CVU'] =
								text.match(/\d+/g) !== null
									? text.match(/\d+/g)![0].trim()
									: 'error';
						else if (text.includes('@')) acc['mail'] = text.trim();
						else if (text.includes('CBU'))
							acc['CBU'] = text.match(/\d+/g)![0].trim();
						else {
							if (acc['adicional'] === undefined) acc['adicional'] = [];
							(acc['adicional'] as (string | number)[]).push(
								text.replace('Copiar', '').trim(),
							);
						}

						return acc;
					}, {} as Record<string, string | number | (string | number)[]>),
			),
		]);

		await page.close();
		return {...movement, status, user, userDetails, type, movementId};
	});

	const detailedMovemets = await Promise.all(detailedMovemetsPromises);
	await browser.close();
	console.log(detailedMovemets);
	return detailedMovemets;
};

export const steps: Record<
	string,
	({
		page,
		browser,
	}: {
		page: Page;
		browser: Browser;
	}) => Promise<DetailedMovement[]>
> = {
	mercadoPago: mpSteps,
};
