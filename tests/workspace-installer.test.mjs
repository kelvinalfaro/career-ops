import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { extractWorkspaceArgs, markWorkspace, resolveWorkspace, saveDefaultWorkspace } from '../lib/workspace.mjs';
import { destinations, installSkill } from '../install-skill.mjs';

test('fork workspace resolution honors explicit, environment, and saved locations', () => {
  const root = mkdtempSync(join(tmpdir(), 'career-ops-workspace-'));
  try {
    const env = { CAREER_OPS_CONFIG: join(root, 'config.json') };
    saveDefaultWorkspace(join(root, 'saved'), env);
    assert.equal(resolveWorkspace({ env, cwd: root }), resolve(root, 'saved'));
    assert.equal(resolveWorkspace({ env: { ...env, CAREER_OPS_WORKSPACE: join(root, 'environment') } }), resolve(root, 'environment'));
    assert.equal(resolveWorkspace({ explicit: join(root, 'explicit'), env }), resolve(root, 'explicit'));
    const parsed = extractWorkspaceArgs(['tracker', '--workspace', root, '--json']);
    assert.deepEqual(parsed.args, ['tracker', '--json']); assert.equal(parsed.workspace, resolve(root));
    assert.equal(JSON.parse(readFileSync(markWorkspace(root), 'utf8')).product, 'career-ops');
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('career concierge installs to portable and native agent skill locations', () => {
  const home = mkdtempSync(join(tmpdir(), 'career-ops-skills-'));
  try {
    const installed = installSkill({ agent: 'all', home });
    assert.deepEqual(installed.map((x) => x.destination).sort(), destinations('all', home).map((x) => resolve(x)).sort());
    for (const item of installed) assert.match(readFileSync(join(item.destination, 'SKILL.md'), 'utf8'), /name: career-concierge/);
  } finally { rmSync(home, { recursive: true, force: true }); }
});
