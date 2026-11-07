#!/usr/bin/env node
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, isAbsolute, relative, sep, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { isMainModule } from './lib/is-main-module.mjs';
import { installSkill } from './install-skill.mjs';
import { extractWorkspaceArgs, markWorkspace, readConfig, saveDefaultWorkspace } from './lib/workspace.mjs';
const system = dirname(fileURLToPath(import.meta.url));
function option(args, name) { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; }
function copyMissing(source, target) { if (existsSync(target)) return false; mkdirSync(dirname(target), { recursive: true }); copyFileSync(source, target); return true; }
async function chooseWorkspace(args) {
  const supplied = extractWorkspaceArgs(args).workspace ?? process.env.CAREER_OPS_WORKSPACE;
  if (supplied) return resolve(supplied);
  const fallback = resolve(readConfig().default_workspace ?? join(homedir(), 'career-ops-workspace'));
  if (args.includes('--yes') || !input.isTTY) return fallback;
  const rl = createInterface({ input, output });
  try {
    const answer = await rl.question(`Enter an existing or new private career workspace [${fallback}]: `);
    return resolve(answer.trim().replace(/^"([^"]+)"$/, '$1') || fallback);
  } finally {
    rl.close();
  }
}
export async function setup(args = process.argv.slice(2)) {
  const workspace = await chooseWorkspace(args);
  const fromEngine = relative(system, workspace);
  if (!fromEngine || (!isAbsolute(fromEngine) && fromEngine !== '..' && !fromEngine.startsWith('..' + sep))) {
    throw new Error('Choose a private workspace outside the engine folder.');
  }
  markWorkspace(workspace);
  const created = [];
  for (const [source, target] of [['config/profile.example.yml','config/profile.yml'], ['modes/_profile.template.md','modes/_profile.md'], ['modes/_custom.template.md','modes/_custom.md'], ['templates/portals.example.yml','portals.yml']]) {
    if (copyMissing(join(system, ...source.split('/')), join(workspace, ...target.split('/')))) created.push(target);
  }
  for (const directory of ['data', 'reports', 'output', 'jds', 'interview-prep', 'writing-samples', 'batch/tracker-additions']) mkdirSync(join(workspace, ...directory.split('/')), { recursive: true });
  const tracker = join(workspace, 'data', 'applications.md'); if (!existsSync(tracker)) { writeFileSync(tracker, '# Applications Tracker\n\n| # | Date | Company | Role | Score | Status | PDF | Report | Notes |\n|---|---|---|---|---|---|---|---|---|\n'); created.push('data/applications.md'); }
  const pipeline = join(workspace, 'data', 'pipeline.md'); if (!existsSync(pipeline)) { writeFileSync(pipeline, '# Pipeline — Pending URLs\n\n## Pending\n\n## Processed\n'); created.push('data/pipeline.md'); }
  const agent = option(args, '--agent');
  const installed = agent ? installSkill({ agent }) : [];
  const dataRootMarker = join(system, '.career-ops-data');
  if (!existsSync(dataRootMarker) || readFileSync(dataRootMarker, 'utf8').trim() !== workspace) {
    writeFileSync(dataRootMarker, workspace + '\n');
  }
  const config = saveDefaultWorkspace(workspace);
  const missing = ['cv.md', 'config/profile.yml', 'modes/_profile.md', 'portals.yml'].filter((path) => !existsSync(join(workspace, ...path.split('/'))));
  return { product: 'career-ops', system, workspace, config: config.path, created, installed, onboardingNeeded: missing.length > 0, missing };
}
if (isMainModule(import.meta.url)) {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log('Usage: node setup.mjs --workspace <private-folder> [--agent portable|codex|gemini|claude|all]');
  } else {
    setup().then((result) => console.log(JSON.stringify(result, null, 2)))
      .catch((error) => { console.error(error.message); process.exit(1); });
  }
}
