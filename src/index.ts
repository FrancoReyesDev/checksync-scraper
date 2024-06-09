// import {runTest} from './test';
// runTest();

export { launchLogin } from "./lib/launchLogin";
export { loginWithCookies } from "./lib/loginWithCookies";
export { manager } from "./scraper/manager";

export type { Manager, Scraper, Scrapers } from "./types/Manager";
export type { ScraperFactory } from "./types/ScraperFactory";
export type { ScraperConfig } from "./types/ScraperConfig";
export type { LaunchLogin } from "./types/Lib";
export type { ScraperStatus } from "./types/ScraperStatus";
