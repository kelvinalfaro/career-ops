#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = dirname(fileURLToPath(import.meta.url)); const source = join(root, '.agents', 'skills', 'career-concierge');
export function destinations(agent = 'portable', home = homedir()) {
  const roots = { portable: join(home, '.agents', 'skills'), codex: join(home, '.codex', 'skills'), gemini: join(home, '.gemini', 'skills'), claude: join(home, '.claude', 'skills') };
  const names = agent === 'all' ? Object.keys(roots) : String(agent).split(',').map((x) => x.trim()).filter(Boolean);
  return [...new Set(names.map((name) => { if (!roots[name]) throw new Error(`Unknown agent target: ${name}`); return join(roots[name], 'career-concierge'); }))];
}
export function installSkill({ agent = 'portable', home = process.env.CAREER_OPS_SKILLS_HOME ?? homedir() } = {}) {
  if (!existsSync(source)) throw new Error(`Bundled skill missing: ${source}`); const version = readFileSync(join(root, 'VERSION'), 'utf8').trim().split(/\s+/)[0];
  return destinations(agent, home).map((destination) => { mkdirSync(dirname(destination), { recursive: true }); rmSync(destination, { recursive: true, force: true }); cpSync(source, destination, { recursive: true }); return { destination: resolve(destination), version }; });
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) console.log(JSON.stringify({ installed: installSkill({ agent: process.argv[3] ?? 'portable' }) }, null, 2));
