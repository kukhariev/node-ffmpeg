import * as spawnargs from 'spawn-args';

export function escapeShell(str: string): string {
  return `"${str.replace(/(["\s'$`\\])/g, '\\$1')}"`;
}

export function parse(argsString: string): string[] {
  return spawnargs(argsString, { removequotes: 'always' });
}

export const noop = (): void => undefined;
