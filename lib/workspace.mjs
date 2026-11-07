import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, resolve } from 'node:path';

export const WORKSPACE_MARKER = '.career-ops-workspace.json';
export function configPath(env = process.env) { return resolve(env.CAREER_OPS_CONFIG ?? `${homedir()}/.career-ops/config.json`); }
export function readConfig(env = process.env) {
  const path = configPath(env); if (!existsSync(path)) return { path, default_workspace: null };
  try { return { path, ...JSON.parse(readFileSync(path, 'utf8')) }; }
  catch (error) { throw new Error(`Invalid Career Ops config at ${path}: ${error.message}`); }
}
export function saveDefaultWorkspace(workspace, env = process.env) {
  const path = configPath(env); const value = { version: 1, default_workspace: resolve(workspace) };
  mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`); return { path, ...value };
}
export function markWorkspace(workspace) {
  const root = resolve(workspace); mkdirSync(root, { recursive: true }); const path = resolve(root, WORKSPACE_MARKER);
  try {
    writeFileSync(path, `${JSON.stringify({ product: 'career-ops', workspace_version: 1 }, null, 2)}\n`, { flag: 'wx' });
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
  }
  return path;
}
export function extractWorkspaceArgs(args = []) {
  const remaining = []; let workspace = null;
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === '--workspace') { if (!args[i + 1]) throw new Error('--workspace requires a path'); workspace = args[++i]; }
    else if (args[i].startsWith('--workspace=')) workspace = args[i].slice(12);
    else remaining.push(args[i]);
  }
  return { workspace: workspace ? resolve(workspace) : null, args: remaining };
}
export function resolveWorkspace({ explicit, env = process.env, cwd = process.cwd() } = {}) {
  return explicit ? resolve(explicit) : env.CAREER_OPS_WORKSPACE ? resolve(env.CAREER_OPS_WORKSPACE)
    : readConfig(env).default_workspace ? resolve(readConfig(env).default_workspace) : resolve(cwd);
}
