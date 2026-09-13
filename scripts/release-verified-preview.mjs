import { spawnSync } from 'node:child_process';
import {
  fail,
  git,
  parseArgs,
  projectRoot,
  readJson,
} from './guard-lib.mjs';

const args = parseArgs();
const preview = args.get('preview');
const rollback = args.get('rollback');
const identity = readJson('guardrails/site-identity.json');
const commit = git(['rev-parse', 'HEAD']);
const expectedApproval = `${preview || ''}|${commit}`;
const vercelCommand = process.platform === 'win32' ? 'vercel.cmd' : 'vercel';
const nodeCommand = process.execPath;

if (!preview || !rollback) {
  fail('Usage: node scripts/release-verified-preview.mjs --preview <verified-url> --rollback <known-good-production-url>');
}
if (process.env.BPF_PRODUCTION_APPROVAL !== expectedApproval) {
  fail(`Production approval is missing. Set BPF_PRODUCTION_APPROVAL to the exact preview URL and commit joined by | after human approval.`);
}

function run(command, commandArgs, { allowFailure = false } = {}) {
  console.log(`> ${command} ${commandArgs.join(' ')}`);
  const result = spawnSync(command, commandArgs, {
    cwd: projectRoot,
    env: { ...process.env, NO_COLOR: '1', NEXT_TELEMETRY_DISABLED: '1' },
    encoding: 'utf8',
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if (result.error) fail(`Unable to run ${command}: ${result.error.message}`);
  if (result.status !== 0 && !allowFailure) fail(`${command} exited with ${result.status ?? 'unknown'}.`);
  return result.status === 0;
}

run(nodeCommand, ['scripts/check-repository-identity.mjs', '--mode=production']);
run(vercelCommand, ['inspect', preview]);
run(vercelCommand, ['inspect', rollback]);
run(nodeCommand, ['scripts/check-preview.mjs', '--url', preview, '--retries', '3']);

console.log(`Promoting verified preview for commit ${commit}.`);
run(vercelCommand, ['promote', preview, '--yes']);

const productionOk = run(
  nodeCommand,
  ['scripts/check-preview.mjs', '--url', identity.siteUrl, '--retries', '3'],
  { allowFailure: true },
);
if (!productionOk) {
  console.error('Post-promotion acceptance failed. Rolling back to the explicitly verified deployment.');
  const rollbackOk = run(vercelCommand, ['rollback', rollback, '--yes'], { allowFailure: true });
  if (!rollbackOk) fail('Automatic rollback also failed. Immediate manual intervention is required.', 2);
  fail('Production acceptance failed; the previous deployment was restored.', 2);
}

console.log('Production promotion passed all acceptance checks.');

