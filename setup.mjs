#!/usr/bin/env node
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { installSkill } from './install-skill.mjs';
import { markWorkspace, saveDefaultWorkspace } from './lib/workspace.mjs';
const system = dirname(fileURLToPath(import.meta.url));
function option(args, name) { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; }
function copyMissing(source, target) { if (existsSync(target)) return false; mkdirSync(dirname(target), { recursive: true }); copyFileSync(source, target); return true; }
export function setup(args = process.argv.slice(2)) {
  const workspace = resolve(option(args, '--workspace') ?? process.env.CAREER_OPS_WORKSPACE ?? 'career-ops-workspace');
  markWorkspace(workspace); const config = saveDefaultWorkspace(workspace); const created = [];
  for (const [source, target] of [['config/profile.example.yml','config/profile.yml'], ['modes/_profile.template.md','modes/_profile.md'], ['modes/_custom.template.md','modes/_custom.md'], ['templates/portals.example.yml','portals.yml']]) {
    if (copyMissing(join(system, ...source.split('/')), join(workspace, ...target.split('/')))) created.push(target);
  }
  for (const directory of ['data', 'reports', 'output', 'jds', 'interview-prep', 'writing-samples', 'batch/tracker-additions']) mkdirSync(join(workspace, ...directory.split('/')), { recursive: true });
  const tracker = join(workspace, 'data', 'applications.md'); if (!existsSync(tracker)) { writeFileSync(tracker, '# Applications Tracker\n\n| # | Date | Company | Role | Score | Status | PDF | Report | Notes |\n|---|---|---|---|---|---|---|---|---|\n'); created.push('data/applications.md'); }
  const pipeline = join(workspace, 'data', 'pipeline.md'); if (!existsSync(pipeline)) { writeFileSync(pipeline, '# Pipeline — Pending URLs\n\n## Pending\n\n## Processed\n'); created.push('data/pipeline.md'); }
  const agent = option(args, '--agent') ?? 'portable'; const installed = installSkill({ agent });
  const missing = ['cv.md', 'config/profile.yml', 'modes/_profile.md', 'portals.yml'].filter((path) => !existsSync(join(workspace, ...path.split('/'))));
  return { product: 'career-ops', system, workspace, config: config.path, created, installed, onboardingNeeded: missing.length > 0, missing };
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) { try { console.log(JSON.stringify(setup(), null, 2)); } catch (error) { console.error(error.message); process.exit(1); } }
