import {manager} from 'src';

export const runTest = () => {
	const {
		scrapers: {mp},
	} = manager({mp: {setMovements: () => {}, findMovement: () => undefined}});

	console.log(mp.getSessionCookies());
	mp.scrap(true);
};
