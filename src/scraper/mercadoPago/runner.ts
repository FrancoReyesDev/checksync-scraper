import {Browser, Page} from 'puppeteer';
import {
	DetailedMovement,
	MercadoPagoScraperDependencies,
	Movement,
} from './types';

const goToActivities = async ({
	page,
	pageNumber,
}: {
	page: Page;
	pageNumber: number;
}) => {
	await page.goto('https://www.mercadopago.com.ar/activities/' + pageNumber, {
		waitUntil: 'networkidle0',
	});
};

const getFinalPageNumberOnActivities = async ({page}: {page: Page}) => {
	await goToActivities({page, pageNumber: 1});
	const paginationButton = 'li.andes-pagination__button';

	await page.waitForSelector(paginationButton);
	return await page.$$eval(paginationButton, buttons => {
		const getBeforeLastButton =
			buttons[buttons.length - 2] ?? buttons[buttons.length - 1];
		return getBeforeLastButton !== undefined
			? Number(getBeforeLastButton.textContent) ?? 1
			: 1;
	});
};

const getPageMovements = async ({page}: {page: Page}) => {
	const label = 'a.ui-row__link';
	const negativeSymbol = 'andes-money-amount__negative-symbol';
	const amountFraction = 'andes-money-amount__fraction';
	const amountCents = 'andes-money-amount__cents';
	const formatAmount = (fraction: string, cents: string) =>
		Number(`${fraction.replaceAll('.', '')}.${cents}`);

	const movements = await page.$$eval(
		label,
		(movement, negativeSymbol, amountCents, amountFraction) =>
			movement
				.filter(a => a.getElementsByClassName(negativeSymbol)[0] === undefined)
				.map(a => {
					const url = a.href;
					const date = a.getElementsByTagName('time')[0]!.textContent!;
					const fraction =
						a.getElementsByClassName(amountFraction)[0]!.textContent!;
					const cents = a.getElementsByClassName(amountCents)[0]!.textContent!;

					return {url, date, fraction, cents};
				}),
		negativeSymbol,
		amountCents,
		amountFraction,
	);

	return movements.map(({url, date, fraction, cents}) => ({
		url,
		date,
		amount: formatAmount(fraction, cents),
	}));
};

const openMovement = async ({
	browser,
	url,
}: {
	browser: Browser;
	url: string;
}) => {
	const page = await browser.newPage();
	await page.goto(url, {waitUntil: 'networkidle0'});
	return page;
};

const movementClassSelectors = {
	id: 'span.c-copy-operation__text--initial',
	type: 'div.ticket-v2-row__title',
	status: 'div.andes-message__content',
	userName: 'li.user-info-v2__name',
	userDetails: 'li.user-info-v2__detail',
};

const waitForIdSelector = async ({page}: {page: Page}) => {
	const {id} = movementClassSelectors;
	return page
		.waitForSelector(id, {
			timeout: 2000,
		})
		.then(() => true)
		.catch(() => false);
};

const retryOnError = async ({page}: {page: Page}) => {
	for (let attempt = 1; attempt <= 2; attempt++) {
		console.log('reintento ' + attempt);
		try {
			await page.reload({waitUntil: 'networkidle0'});
			const pageLoadedCorrectly = await waitForIdSelector({page});
			if (pageLoadedCorrectly) return true;
		} catch (error) {
			console.error(`Error on attempt ${attempt} to reload page:`, error);
			if (attempt === 2) return false;
		}
	}
};

// const retryOnError = async ({page}: {page: Page}) => {
// 	for (let attempt = 1; attempt <= 2; attempt++) {
// 		page.reload({waitUntil: 'networkidle0'});
// 		const pageLoadedCorrectly = await waitForIdSelector({page});
// 		if (pageLoadedCorrectly) return true;
// 		if (attempt === 3) return false;
// 	}
// };

const waitForSelectors = async ({page}: {page: Page}) => {
	const {type, status, userName, userDetails} = movementClassSelectors;

	let statusDoesntExist = false;
	let userInfoDoesntExist = false;
	let typeDoesntExist = false;

	await Promise.all([
		page
			.waitForSelector(type, {timeout: 2000})
			.catch(() => (typeDoesntExist = true)),
		page
			.waitForSelector(status, {timeout: 2000})
			.catch(() => (statusDoesntExist = true)),
		page
			.waitForSelector(userName, {timeout: 2000})
			.catch(() => (userInfoDoesntExist = true)),
		page
			.waitForSelector(userDetails, {timeout: 2000})
			.catch(() => (userInfoDoesntExist = true)),
	]);

	return {
		statusDoesntExist,
		userInfoDoesntExist,
		typeDoesntExist,
	};
};

const formatDetails = (details: Element[]) =>
	details.reduce((acc, li) => {
		const text = li.textContent;
		if (text === null) return acc;

		if (text.includes('CUIT/CUIL'))
			acc['CUIT/CUIL'] =
				text.match(/\d+/g) !== null ? text.match(/\d+/g)![0].trim() : 'error';
		else if (text.includes('CVU'))
			acc['CVU'] =
				text.match(/\d+/g) !== null ? text.match(/\d+/g)![0].trim() : 'error';
		else if (text.includes('@')) acc['mail'] = text.trim();
		else if (text.includes('CBU')) acc['CBU'] = text.match(/\d+/g)![0].trim();
		else {
			if (acc['adicional'] === undefined) acc['adicional'] = [];
			(acc['adicional'] as (string | number)[]).push(
				text.replace('Copiar', '').trim(),
			);
		}

		return acc;
	}, {} as DetailedMovement['userDetails']);

const getDetailedMovement = async ({
	page,
	typeDoesntExist,
	userInfoDoesntExist,
	statusDoesntExist,
}: {
	page: Page;
	typeDoesntExist: boolean;
	userInfoDoesntExist: boolean;
	statusDoesntExist: boolean;
}) => {
	const [id, type, status, userName, userDetails] = await Promise.all([
		page.$eval(movementClassSelectors.id, span =>
			span.textContent!.match(/\d+/g)![0].trim(),
		),
		typeDoesntExist
			? undefined
			: page.$eval(movementClassSelectors.type, div => div.textContent),
		statusDoesntExist
			? undefined
			: page.$eval(movementClassSelectors.status, div => div.textContent),
		userInfoDoesntExist
			? undefined
			: page.$eval(movementClassSelectors.userName, li => li.textContent),
		userInfoDoesntExist
			? undefined
			: page.$$eval(movementClassSelectors.userDetails, formatDetails),
	]);

	return {id, type, status, userDetails, userName};
};

const getDetailedMovementHandler = async ({
	browser,
	movement,
}: {
	browser: Browser;
	movement: Movement;
}): Promise<DetailedMovement | Movement> => {
	const page = await openMovement({browser, url: movement.url});
	const pageLoadedCorrectly =
		(await waitForIdSelector({page})) || (await retryOnError({page}));
	if (!pageLoadedCorrectly) return movement;

	const {statusDoesntExist, userInfoDoesntExist, typeDoesntExist} =
		await waitForSelectors({page});

	const detailedMovement = await getDetailedMovement({
		page,
		statusDoesntExist,
		typeDoesntExist,
		userInfoDoesntExist,
	});
	await page.close();

	return {...movement, ...detailedMovement};
};

const getPageDetailedMovements = async ({
	pageNumber,
	page,
	browser,
}: {
	pageNumber: number;
	page: Page;
	browser: Browser;
}) => {
	await goToActivities({page, pageNumber});
	const movements = await getPageMovements({page});
	return Promise.all(
		movements.map(movement => getDetailedMovementHandler({browser, movement})),
	);
};

export const runner = async ({
	//no tiene sentido que el runner tenga la opcion de cerrarse externamente
	page,
	browser,
	startFromId,
	maxPage,
	findMovement,
}: {
	page: Page;
	browser: Browser;
	startFromId?: string;
	maxPage?: number;
} & Omit<MercadoPagoScraperDependencies, 'setMovements'>) => {
	const detailedMovements: DetailedMovement[] = [];
	const failedAttempts: Movement[] = [];

	const finalPageNumber = await getFinalPageNumberOnActivities({page});

	for (
		let pageNumber = 1,
			inMaxPage = false,
			foundLastIndex = false,
			startSurpassed = false;
		!foundLastIndex && !startSurpassed && !inMaxPage;
		pageNumber++
	) {
		const pageDetailedMovements = await getPageDetailedMovements({
			page,
			browser,
			pageNumber,
		});
		pageDetailedMovements.forEach(movement => {
			if (movement === null || !('id' in movement)) return;

			if (startSurpassed || foundLastIndex) return;

			if (startFromId !== undefined && movement.id === startFromId) {
				startSurpassed = true;
				return detailedMovements.push(movement);
			}

			const movementAlreadyExist = findMovement(movement) !== undefined;
			if (movementAlreadyExist) return (foundLastIndex = true);

			return detailedMovements.push(movement);
		});

		if (maxPage !== undefined && maxPage === pageNumber) inMaxPage = true;
		if (finalPageNumber === pageNumber) foundLastIndex = true;
	}

	// await browser.close();
	return detailedMovements;
};
