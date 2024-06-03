import {DataSource} from 'typeorm/browser';
import {MercadoPagoMovement} from './entity/MercadoPagoMovement.js';
import 'reflect-metadata';

export const initializeDatabase = () => {
	const appDataSource = new DataSource({
		type: 'better-sqlite3',
		database: `./data/checksync.sqlite`,
		entities: [MercadoPagoMovement],
		synchronize: true,
	});

	appDataSource.initialize();
};
