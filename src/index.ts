// import {runTest} from './test';
// runTest();

export {loginHandler} from './lib/loginHandler';
export {loginWithCookies} from './lib/loginWithCookies';
export {manager} from './scraper/manager';

export type {Manager, Scraper, Scrapers} from './types/Manager';
export type {ScraperFactory} from './types/ScraperFactory';
export type {ScraperConfig} from './types/ScraperConfig';
export type {LoginHandler, LoginClientHandler} from './types/Lib';
