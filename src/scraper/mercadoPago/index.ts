import puppeteer, { Browser, Cookie } from "puppeteer";
import {
  Action,
  LoggedState,
  MercadoPagoScraper,
  MercadoPagoScraperDependencies,
  State,
} from "./types";
import { runner } from "./runner";
import { loginWithCookies } from "src/lib/loginWithCookies";
import { launchLogin } from "src/lib/launchLogin";
import { useReducer } from "src/utils/useReducer";
import { ScraperStatus } from "src/types/ScraperStatus";
import { SessionCookiesSchema } from "src/schemas/sessionCookiesSchema";

export const config = {
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

const scrap = async ({
  visible = false,
  sessionCookies,
  findMovement,
  setMovements,
}: {
  visible: boolean;
  sessionCookies: Cookie[];
} & MercadoPagoScraperDependencies) => {
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

const loginHandler = (state: State, action: Action) =>
  "sessionCookies" in action
    ? ({
        findMovement: state.findMovement,
        setMovements: state.setMovements,
        sessionCookies: action.sessionCookies,
        state: "logged",
        status: "not_working",
      } satisfies LoggedState)
    : state;

const reducer = (state: State, action: Action) => {
  const exec: Record<
    State["state"],
    { [key in Action["type"]]?: (state: State, action: Action) => State }
  > = {
    logged: {
      login: loginHandler,
      logout: (state) => {
        if ("workingInterval" in state) clearTimeout(state.workingInterval);
        return {
          state: "not_logged",
          setMovements: state.setMovements,
          findMovement: state.findMovement,
        };
      },
      start: (state) => {
        const { sessionCookies, setMovements, findMovement } =
          state as LoggedState;
        if ("workingInterval" in state) clearTimeout(state.workingInterval);

        scrap({ sessionCookies, findMovement, setMovements, visible: false });
        const workingInterval = setInterval(() => {
          scrap({ sessionCookies, findMovement, setMovements, visible: false });
        }, config.scrap.frequency);

        return {
          state: "logged",
          findMovement,
          sessionCookies,
          setMovements,
          status: "working",
          workingInterval,
        };
      },
      finish: (state) => {
        const { findMovement, sessionCookies, setMovements } =
          state as LoggedState;
        if ("workingInterval" in state) clearTimeout(state.workingInterval);

        return {
          state: "logged",
          status: "not_working",
          findMovement,
          setMovements,
          sessionCookies,
        };
      },
      scrap: (state) => {
        const { sessionCookies, setMovements, findMovement } =
          state as LoggedState;
        scrap({ sessionCookies, setMovements, findMovement, visible: false });
        return state;
      },
    },
    not_logged: {
      login: loginHandler,
    },
  };

  return exec[state.state]?.[action.type]?.(state, action) || state;
};

export const mercadoPagoScraper: MercadoPagoScraper = ({
  findMovement,
  setMovements,
}) => {
  const { getState, dispatch } = useReducer<State, Action>(reducer, {
    state: "not_logged",
    findMovement,
    setMovements,
  });

  const launchLoginHandler = () => {
    return launchLogin({
      loggedPathHint: config.loggedInPathHint,
      loginUrl: config.loginUrl,
    });
  };

  const getConfig = () => config;

  const getStatus = (): ScraperStatus => {
    const state = getState();
    const isLogged = state.state === "logged";
    const isWorking = "status" in state && state.status === "working";
    return {
      logged: isLogged,
      working: isWorking,
      sessionExpirationTimeStamp: isLogged ? 1000 : 0, // Debemops encontrar una forma de conseguir la expiracion minima de las cookies de sesion
    };
  };

  const loginDispatch = (sessionCookies: Cookie[]) => {
    const validation = SessionCookiesSchema.safeParse(sessionCookies);
    if (!validation.success) {
      return { error: "schema error" };
    }

    dispatch({ type: "login", sessionCookies });
    return { success: "Se ha logueado con exito" };
  };

  const logoutDispatch = () => dispatch({ type: "logout" });
  const startDispatch = () => dispatch({ type: "start" });
  const finishDispatch = () => dispatch({ type: "finish" });
  const scrapDispatch = () => dispatch({ type: "scrap" });

  return {
    getConfig,
    getStatus,

    login: loginDispatch,
    launchLogin: launchLoginHandler,
    logout: logoutDispatch,
    start: startDispatch,
    finish: finishDispatch,
    scrap: scrapDispatch,
  };
};
