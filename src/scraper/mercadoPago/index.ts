import puppeteer, { Browser, Cookie } from "puppeteer";
import { MercadoPagoScraper } from "./types";
import { runner } from "./runner";
import { loginWithCookies } from "src/lib/loginWithCookies";
import { loginHandler } from "src/lib/loginHandler";

const config = {
  name: "mercado pago",
  color: "",
  loginUrl: "https://www.mercadolibre.com/jms/mla/lgz/login?platform_id=MP",
  loggedOrigin: "https://www.mercadopago.com.ar",
  loggedInPathHint: "home",
  scrap: {
    frequency: 1800000,
    startFromId: "75279230369",
    maxPage: 10,
  },
};
const sessionCookies: Cookie[] = [];

const status = {
  isLoggedIn: false,
  isWorking: false,
};

export const mercadoPagoScraper: MercadoPagoScraper = ({
  findMovement,
  setMovements,
}) => {
  const initialState = {
    config,
    sessionCookies,
    status,
  };

  const [] = 





  let workingInterval: NodeJS.Timeout | null = null;

  const loginClientHandler: ReturnType<MercadoPagoScraper>["loginClientHandler"] =
    () => {
      const { login, close } = loginHandler({
        loggedPathHint: config.loggedInPathHint,
        loginUrl: config.loginUrl,
      });

      const handleLogin = async () => {
        const loginAttempt = await login();
        if ("cookies" in loginAttempt) {
          sessionCookies = loginAttempt.cookies;
          return true;
        }
        return false;
      };

      return { login: handleLogin, close };
    };

  const login: ReturnType<MercadoPagoScraper>["login"] = (
    newSessionCookies
  ) => {
    console.log("login on " + getConfig().name);
    sessionCookies = newSessionCookies;
    status.isLoggedIn = true;
  };

  const start = () => {
    if (status.isLoggedIn === false || workingInterval !== null) finish();
    console.log("start on " + getConfig().name);

    scrap(true);
    workingInterval = setInterval(() => {
      console.log("intervalo");
      scrap(true);
    }, config.scrap.frequency);
  };

  const logout = () => {
    sessionCookies = [];
    status.isLoggedIn = false;
  };

  const scrap = async (visible: boolean = false) => {
    if (sessionCookies.length === 0) return;

    console.log("scrapeando...");
    const browser = await puppeteer.launch({ headless: !visible });
    const page = await loginWithCookies({
      loggedOrigin: config.loggedOrigin,
      sessionCookies,
      browser,
    });
    const movements = await runner({
      page,
      browser,
      findMovement,
      startFromId: config.scrap.startFromId,
      maxPage: config.scrap.maxPage,
    });

    browser.close();

    setMovements(movements);
  };

  const finish = () => {
    if (status.isLoggedIn === false) return;

    clearTimeout(workingInterval as NodeJS.Timeout);
  };

  const getConfig = () => config;
  const getStatus = () => status;
  const getSessionCookies = () => sessionCookies;

  const transitions = {
    logged_in: {
      working: {},
      notWorking: {},
    },
    notLogged_in: {},
  };

  return {
    getConfig,
    getStatus,
    getSessionCookies,
    login,
    loginClientHandler,
    logout,
    start,
    finish,
    scrap,
  };
};
