import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';

const CLI = ['tsx', 'scripts/get-user-jwt.ts'];

function runScript(env: NodeJS.ProcessEnv) {
  return new Promise<{ code: number | null; stderr: string }>((resolve) => {
    const proc = spawn('npx', CLI, { env: { ...env, PATH: process.env.PATH } });
    let stderr = '';
    proc.stderr.on('data', (d) => {
      stderr += d.toString();
    });
    proc.on('close', (code) => resolve({ code, stderr }));
  });
}

test('fails when env vars are missing', async () => {
  const { code, stderr } = await runScript({});
  assert.notEqual(code, 0);
  assert.match(stderr, /Missing env/);
});
