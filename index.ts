import {initializeDatabase} from './database/index.js';

export const initializeScraper = () => {
	initializeDatabase();
};

initializeScraper();
