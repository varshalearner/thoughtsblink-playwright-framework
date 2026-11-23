/**
 * Removes headers and cookies from recorded HAR files before they are committed.
 * routeFromHAR matches on URL and method only, so replay does not need them, and they carry
 * the Supabase API key and Cloudflare cookies that do not belong in a public repo.
 *
 * Usage: node scripts/scrub-har.mts tests/hars/catalogue.har
 */
import { readFileSync, writeFileSync } from 'node:fs';

interface HarMessage {
  headers: unknown[];
  cookies: unknown[];
}

interface Har {
  log: { entries: { request: HarMessage; response: HarMessage }[] };
}

for (const file of process.argv.slice(2)) {
  const har = JSON.parse(readFileSync(file, 'utf8')) as Har;
  for (const { request, response } of har.log.entries) {
    for (const message of [request, response]) {
      message.headers = [];
      message.cookies = [];
    }
  }
  writeFileSync(file, `${JSON.stringify(har, null, 2)}\n`);
  console.log(`Scrubbed ${String(har.log.entries.length)} entries in ${file}`);
}
