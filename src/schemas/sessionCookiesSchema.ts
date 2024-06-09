import { z } from "zod";

// Definiciones adicionales que puedes necesitar
const CookieSameSite = z.enum(["Strict", "Lax", "None"]);
const CookiePriority = z.enum(["Low", "Medium", "High"]);
const CookieSourceScheme = z.enum(["Unset", "NonSecure", "Secure"]);

export const SessionCookiesSchema = z.array(
  z.object({
    name: z.string(),
    value: z.string(),
    domain: z.string(),
    path: z.string(),
    expires: z.number(),
    size: z.number(),
    httpOnly: z.boolean(),
    secure: z.boolean(),
    session: z.boolean(),
    sameSite: CookieSameSite.optional(),
    priority: CookiePriority.optional(),
    sameParty: z.boolean().optional(),
    sourceScheme: CookieSourceScheme.optional(),
    partitionKey: z.string().optional(),
    partitionKeyOpaque: z.boolean().optional(),
  })
);
