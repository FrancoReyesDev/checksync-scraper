import {Browser, Page} from 'puppeteer';

type DetailedMovement = {
	status: string | undefined;
	user: string | undefined;
	userDetails:
		| Record<string, string | number | (string | number)[]>
		| undefined;
	type: string | undefined;
	movementId: string | undefined;
	link: string;
	date: string | null;
	amount: number;
};

const mpSteps = async ({
	page,
	browser,
	statusData,
	startFromId,
	maxPage,
}: {
	page: Page;
	browser: Browser;
	statusData?: {lastId: string; cookiesExpiration: number};
	startFromId: string;
	maxPage: number;
}) => {
	const readPage = async (pageNumber: number) => {
		await page.goto('https://www.mercadopago.com.ar/activities/' + pageNumber, {
			waitUntil: 'networkidle0',
		});

		const movements = await page.$$eval('a.ui-row__link', movement =>
			movement
				.filter(
					a =>
						a.getElementsByClassName(
							'andes-money-amount__negative-symbol',
						)[0] === undefined,
				)
				.map(a => {
					const link = a.href;
					const date = a.getElementsByTagName('time')[0]!.textContent;
					const amount =
						a
							.getElementsByClassName('andes-money-amount__fraction')[0]!
							.textContent!.replaceAll('.', '') +
						'.' +
						a.getElementsByClassName('andes-money-amount__cents')[0]!
							.textContent;
					return {link, date, amount: Number(amount)};
				}),
		);

		const pageDetailedMovemetsPromises = movements.map(async movement => {
			const page = await browser.newPage();
			await page.goto(movement.link, {waitUntil: 'networkidle0'});

			let statusDoesntExist = false;
			let userInfoDoesntExist = false;
			let idDoesntExist = false;
			let typeDoesntExist = false;

			await Promise.all([
				page
					.waitForSelector('span.c-copy-operation__text--initial', {
						timeout: 5000,
					})
					.catch(() => (idDoesntExist = true)),
				page
					.waitForSelector('div.ticket-v2-row__title', {timeout: 5000})
					.catch(() => (typeDoesntExist = true)),
				page
					.waitForSelector('div.andes-message__content', {timeout: 5000})
					.catch(() => (statusDoesntExist = true)),
				page
					.waitForSelector('li.user-info-v2__name', {timeout: 5000})
					.catch(() => (userInfoDoesntExist = true)),
				page
					.waitForSelector('li.user-info-v2__detail', {timeout: 5000})
					.catch(() => (userInfoDoesntExist = true)),
			]);

			if (idDoesntExist) {
				await page.goto(movement.link, {waitUntil: 'networkidle0'});

				await Promise.all([
					page
						.waitForSelector('span.c-copy-operation__text--initial', {
							timeout: 5000,
						})
						.catch(() => (idDoesntExist = true)),
					page
						.waitForSelector('div.ticket-v2-row__title', {timeout: 5000})
						.catch(() => (typeDoesntExist = true)),
					page
						.waitForSelector('div.andes-message__content', {timeout: 5000})
						.catch(() => (statusDoesntExist = true)),
					page
						.waitForSelector('li.user-info-v2__name', {timeout: 5000})
						.catch(() => (userInfoDoesntExist = true)),
					page
						.waitForSelector('li.user-info-v2__detail', {timeout: 5000})
						.catch(() => (userInfoDoesntExist = true)),
				]);
			}

			const [movementId, type, status, user, userDetails] = await Promise.all([
				idDoesntExist
					? undefined
					: page.$eval(
							// Movement Id
							'span.c-copy-operation__text--initial',
							span => span.textContent!.match(/\d+/g)![0].trim(),
					  ),
				typeDoesntExist
					? undefined
					: page.$eval('div.ticket-v2-row__title', div => div.textContent),
				statusDoesntExist
					? undefined
					: page.$eval('div.andes-message__content', div => div.textContent),
				userInfoDoesntExist
					? undefined
					: page.$eval('li.user-info-v2__name', li => li.textContent),
				userInfoDoesntExist
					? undefined
					: page.$$eval(
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

			return status !== null &&
				user !== null &&
				type !== null &&
				movementId !== null
				? {...movement, status, user, userDetails, type, movementId}
				: null;
		});

		const pageDetailedMovemets = await Promise.all(
			pageDetailedMovemetsPromises,
		);
		return pageDetailedMovemets;
	};

	const detailedMovements: DetailedMovement[] = [];
	for (
		let pageNumber = 1,
			inMaxPage = false,
			foundLastIndex = false,
			startSurpassed = false;
		foundLastIndex === false && startSurpassed === false && inMaxPage === false;
		pageNumber++
	) {
		const pageDetailedMovemets = await readPage(pageNumber);
		pageDetailedMovemets.forEach(movement => {
			if (movement === null) return;

			if (movement.movementId === startFromId) {
				startSurpassed = true;
				return detailedMovements.push(movement);
			}

			if (statusData === undefined) return detailedMovements.push(movement);

			if (statusData.lastId === movement.movementId)
				return (foundLastIndex = true);

			return detailedMovements.push(movement);
		});

		if (maxPage === pageNumber) inMaxPage = true;
	}

	await browser.close();
	return detailedMovements;
};

export const accountScrapers: Record<
	string,
	({
		page,
		browser,
		statusData,
		startFromId,
	}: {
		page: Page;
		browser: Browser;
		statusData?: {lastId: string; cookiesExpiration: number};
		startFromId: string;
		maxPage: number;
	}) => Promise<DetailedMovement[]>
> = {
	mercadoPago: mpSteps,
};
