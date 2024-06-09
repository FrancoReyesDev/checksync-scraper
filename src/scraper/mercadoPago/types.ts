import { ScraperDependencies, ScraperFactory } from "src/types/ScraperFactory";
import { ScraperConfig } from "src/types/ScraperConfig";
import { Cookie } from "puppeteer";

// Scraper
export type Movement = {
  url: string;
  date: string;
  amount: number;
};

export interface DetailedMovement extends Movement {
  status: string | undefined;
  userName: string | undefined;
  userDetails: Record<string, string | number | (string | number)[]>;
  type: string | undefined;
  id: string;
  link: string;
  date: string;
}

export type MercadoPagoScraperDependencies = ScraperDependencies<
  Movement | DetailedMovement
>;

export type MercadoPagoScraper = ScraperFactory<
  ScraperConfig,
  MercadoPagoScraperDependencies
>;

// States
export type LoggedState = (
  | {
      state: "logged";
      status: "working";
      sessionCookies: Cookie[];
      workingInterval: NodeJS.Timeout;
    }
  | {
      state: "logged";
      status: "not_working";
      sessionCookies: Cookie[];
    }
) &
  MercadoPagoScraperDependencies;

export type Not_LoggedState = {
  state: "not_logged";
} & MercadoPagoScraperDependencies;

export type State = LoggedState | Not_LoggedState;
export type Action =
  | {
      type: "login";
      sessionCookies: Cookie[];
    }
  | {
      type: "logout";
    }
  | {
      type: "start";
    }
  | {
      type: "finish";
    }
  | {
      type: "scrap";
    };
