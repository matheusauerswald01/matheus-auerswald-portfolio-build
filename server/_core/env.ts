import { z } from "zod";

const insecureSecrets = new Set([
  "secret",
  "changeme",
  "default",
  "password",
  "123456",
  "jwtsecret",
]);

const trimmedString = z.string().transform((value) => value.trim());

const envSchema = z.object({
  // OAuth variables (opcionais - necessárias apenas se usar autenticação OAuth)
  VITE_APP_ID: trimmedString.optional(),
  JWT_SECRET: trimmedString.optional(),
  DATABASE_URL: trimmedString.optional(),
  OAUTH_SERVER_URL: trimmedString.optional(),
  OWNER_OPEN_ID: trimmedString.optional(),
  BUILT_IN_FORGE_API_URL: trimmedString.optional(),
  BUILT_IN_FORGE_API_KEY: trimmedString.optional(),
});

const rawEnv = {
  VITE_APP_ID: process.env.VITE_APP_ID ?? "",
  JWT_SECRET: process.env.JWT_SECRET ?? "",
  DATABASE_URL: process.env.DATABASE_URL,
  OAUTH_SERVER_URL: process.env.OAUTH_SERVER_URL,
  OWNER_OPEN_ID: process.env.OWNER_OPEN_ID,
  BUILT_IN_FORGE_API_URL: process.env.BUILT_IN_FORGE_API_URL,
  BUILT_IN_FORGE_API_KEY: process.env.BUILT_IN_FORGE_API_KEY,
};

const parsedEnv = envSchema.safeParse(rawEnv);

if (!parsedEnv.success) {
  const formatted = parsedEnv.error.errors
    .map((error) => {
      const path = error.path.join(".") || "unknown";
      return `${path}: ${error.message}`;
    })
    .join("; ");
  throw new Error(`[ENV] Invalid environment configuration - ${formatted}`);
}

const env = parsedEnv.data;

export const ENV = {
  appId: env.VITE_APP_ID ?? "",
  cookieSecret:
    env.JWT_SECRET ?? "development-secret-change-in-production-min-32-chars",
  databaseUrl: env.DATABASE_URL ?? "",
  oAuthServerUrl: env.OAUTH_SERVER_URL ?? "",
  ownerId: env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: env.BUILT_IN_FORGE_API_KEY ?? "",
} as const;
