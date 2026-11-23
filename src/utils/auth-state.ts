import path from 'node:path';
import type { Role } from '@utils/env';

/** Where the setup project saves each role's signed-in browser state (git-ignored). */
export function authFile(role: Role): string {
  return path.resolve(__dirname, '..', '..', '.auth', `${role}.json`);
}
