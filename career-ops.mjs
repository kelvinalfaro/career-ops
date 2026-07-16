#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync, realpathSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractWorkspaceArgs, resolveWorkspace } from './lib/workspace.mjs';
const system = dirname(fileURLToPath(import.meta.url));
const commands = { scan:'scan.mjs', tracker:'tracker.mjs', verify:'verify-pipeline.mjs', normalize:'normalize-statuses.mjs', dedup:'dedup-tracker.mjs', merge:'merge-tracker.mjs', reconcile:'reconcile-pipeline.mjs', find:'find.mjs', patterns:'analyze-patterns.mjs', upskill:'upskill.mjs', followup:'followup-cadence.mjs', add:'add-entry.mjs', pdf:'generate-pdf.mjs', cover:'generate-cover-letter.mjs', extract:'browser-extract.mjs', liveness:'check-liveness.mjs', 'agent-inbox':'agent-inbox.mjs', ollama:'ollama-eval.mjs', openai:'openai-eval.mjs', gemini:'gemini-eval.mjs' };
function envFor(workspace) { return { ...process.env, CAREER_OPS_WORKSPACE: workspace, CAREER_OPS_TRACKER: resolve(workspace,'data/applications.md'), CAREER_OPS_TRACKER_DB: resolve(workspace,'data/applications.db'), CAREER_OPS_REPORTS: resolve(workspace,'reports'), CAREER_OPS_ADDITIONS: resolve(workspace,'batch/tracker-additions'), CAREER_OPS_CV: resolve(workspace,'cv.md'), CAREER_OPS_PROFILE: resolve(workspace,'config/profile.yml'), CAREER_OPS_PORTALS: resolve(workspace,'portals.yml') }; }
function run(script, args, workspace, cwd = workspace) { const result = spawnSync(process.execPath, [resolve(system, script), ...args], { cwd, stdio:'inherit', env:envFor(workspace) }); if (result.error) throw result.error; process.exit(result.status ?? 1); }
function help() { console.log(`career-ops — Command Center\n\nRecommended interface: invoke the career-concierge skill.\n\nCore commands: setup, doctor, scan, tracker, verify, normalize, dedup, merge, reconcile, find, patterns, upskill, followup, add, pdf, cover, extract, liveness, agent-inbox, update.\nUse career-ops status --json to show the configured system and private workspace.`); }
function main() {
  const raw = process.argv.slice(2); if (raw[0] === 'setup' || raw[0] === 'init') return run('setup.mjs', raw[0] === 'init' ? ['--workspace', raw[1] ?? 'career-ops-workspace', ...raw.slice(2)] : raw.slice(1), process.cwd());
  const parsed = extractWorkspaceArgs(raw); const workspace = resolveWorkspace({ explicit: parsed.workspace }); const [mode, ...args] = parsed.args;
  if (!mode || ['help','more','--help','-h'].includes(mode)) return help();
  if (mode === 'status') { console.log(JSON.stringify({ product:'career-ops', system, workspace, configured: existsSync(workspace) }, null, 2)); return; }
  if (mode === 'doctor') return run('doctor.mjs', ['--target', workspace, ...args], workspace);
  if (mode === 'update') return run('update-system.mjs', args.length ? args : ['check'], workspace, system);
  if (commands[mode]) return run(commands[mode], args, workspace);
  throw new Error(`Conversational mode "${mode}" is handled by the career-concierge skill. Run career-ops more for core commands.`);
}
if (process.argv[1] && realpathSync(resolve(process.argv[1])) === realpathSync(fileURLToPath(import.meta.url))) { try { main(); } catch (error) { console.error(error.message); process.exit(1); } }
