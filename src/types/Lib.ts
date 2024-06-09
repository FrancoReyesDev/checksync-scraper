import { Cookie } from "puppeteer";

export type LaunchLogin = ({
  loggedPathHint,
  loginUrl,
}: {
  loginUrl: string;
  loggedPathHint: string;
}) => Promise<{ cookies: Cookie[] } | { error: string }>;
