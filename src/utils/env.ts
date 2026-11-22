import path from 'node:path';
import dotenv from 'dotenv';
import { z } from 'zod';

// Non-secret, per-environment settings live in code; secrets only ever come from .env / CI.
const ENVIRONMENTS = {
  prod: { baseURL: 'https://thoughtsblink.vercel.app' },
  local: { baseURL: 'http://localhost:3000' },
} as const;

type EnvName = keyof typeof ENVIRONMENTS;
const ENV_NAMES = Object.keys(ENVIRONMENTS) as [EnvName, ...EnvName[]];

const rootDir = path.resolve(__dirname, '..', '..');
// Read before dotenv runs: TEST_ENV chooses which file to load, so it cannot come from a file.
const requested = process.env.TEST_ENV ?? 'prod';

// Load into a separate object, not process.env: Playwright workers inherit the runner's
// process.env, so a file value would come back to them disguised as a shell value.
const fromFiles: Record<string, string> = {};
dotenv.config({
  path: [path.join(rootDir, `.env.${requested}`), path.join(rootDir, '.env')],
  processEnv: fromFiles,
  quiet: true,
});

const schema = z.object({
  TEST_ENV: z.enum(ENV_NAMES).default('prod'),
  BASE_URL: z.url().optional(),
});

// Shell and CI secrets beat files; the first file in the list beats the later ones.
const parsed = schema.safeParse({ ...fromFiles, ...process.env, TEST_ENV: requested });
if (!parsed.success) {
  throw new Error(
    `Invalid test configuration:\n${z.prettifyError(parsed.error)}\n` +
      'See .env.example for the supported variables.',
  );
}

const name = parsed.data.TEST_ENV;

export const env = {
  name,
  baseURL: parsed.data.BASE_URL ?? ENVIRONMENTS[name].baseURL,
} as const;
