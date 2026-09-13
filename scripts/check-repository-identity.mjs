import fs from 'node:fs';
import path from 'node:path';
import {
  absolutePath,
  fail,
  git,
  parseArgs,
  projectRoot,
  readJson,
} from './guard-lib.mjs';

const args = parseArgs();
const mode = args.get('mode', 'local');
if (!['local', 'ci', 'production', 'r2-publish'].includes(mode)) {
  fail(`Unknown identity mode: ${mode}`);
}

const identity = readJson('guardrails/site-identity.json');
const packageJson = readJson('package.json');
const failures = [];
const checks = [];
const check = (condition, message) => {
  if (condition) checks.push(message);
  else failures.push(message);
};

const gitTopLevel = path.resolve(git(['rev-parse', '--show-toplevel']));
check(gitTopLevel.toLowerCase() === projectRoot.toLowerCase(), 'Git top level equals the project root');
check(packageJson.name === identity.packageName, `Package sentinel is ${identity.packageName}`);

const remote = git(['remote', 'get-url', 'origin']);
check(identity.git.allowedRemoteUrls.includes(remote), `Origin is the approved repository (${remote})`);

const currentBranch = git(['branch', '--show-current']);
if (mode === 'ci' && process.env.GITHUB_ACTIONS === 'true') {
  check(process.env.GITHUB_REPOSITORY === identity.git.repository, 'GitHub Actions repository matches the pinned repository');
  if (process.env.GITHUB_REPOSITORY_ID) {
    check(Number(process.env.GITHUB_REPOSITORY_ID) === identity.git.repositoryId, 'GitHub Actions repository ID matches');
  }
} else {
  check(Boolean(currentBranch), 'HEAD is attached to a named branch');
}

const productionRef = `refs/remotes/origin/${identity.git.productionBranch}`;
const productionRefExists = (() => {
  try {
    git(['show-ref', '--verify', '--quiet', productionRef]);
    return true;
  } catch {
    return false;
  }
})();
check(productionRefExists, `Remote production ref exists (${identity.git.productionBranch})`);
if (productionRefExists) {
  const ancestry = (() => {
    try {
      git(['merge-base', '--is-ancestor', `origin/${identity.git.productionBranch}`, 'HEAD']);
      return true;
    } catch {
      return false;
    }
  })();
  check(ancestry, `HEAD descends from origin/${identity.git.productionBranch}`);
}

const trackedFiles = git(['ls-files']).split(/\r?\n/).filter(Boolean);
const trackedSecrets = trackedFiles.filter(file =>
  /(^|\/)\.env(?:\.|$)/i.test(file) && !/(^|\/)\.env\.example$/i.test(file),
);
check(trackedSecrets.length === 0, 'No real .env file is tracked');
if (trackedSecrets.length) failures.push(`Tracked environment files: ${trackedSecrets.join(', ')}`);

const status = git(['status', '--porcelain']);
if (mode === 'production' || mode === 'r2-publish') {
  check(status === '', 'Working tree is clean');
  check(currentBranch === identity.git.productionBranch, `Current branch is ${identity.git.productionBranch}`);
  if (productionRefExists) {
    check(git(['rev-parse', 'HEAD']) === git(['rev-parse', `origin/${identity.git.productionBranch}`]), 'HEAD equals the remote production commit');
  }
  check(identity.sourceOfTruthStatus === 'ready', 'GitHub default branch and Vercel production source are unified');
}

const vercelProjectFile = absolutePath('.vercel/project.json');
if (fs.existsSync(vercelProjectFile)) {
  const linked = JSON.parse(fs.readFileSync(vercelProjectFile, 'utf8'));
  check(linked.projectId === identity.vercel.projectId, 'Linked Vercel project ID matches');
  check(linked.orgId === identity.vercel.orgId, 'Linked Vercel organization ID matches');
} else if (mode === 'production') {
  check(process.env.VERCEL_PROJECT_ID === identity.vercel.projectId, 'VERCEL_PROJECT_ID matches');
  check(process.env.VERCEL_ORG_ID === identity.vercel.orgId, 'VERCEL_ORG_ID matches');
}

if (mode === 'r2-publish') {
  const cloudflare = identity.cloudflare;
  check(cloudflare.configured === true, 'Cloudflare identity is configured in site-identity.json');
  check(Boolean(cloudflare.accountId), 'Cloudflare account ID is pinned');
  check(Boolean(cloudflare.bucketName), 'R2 bucket name is pinned');
  check(process.env[cloudflare.accountIdEnv] === cloudflare.accountId, `${cloudflare.accountIdEnv} matches the pinned account`);
  check(process.env[cloudflare.bucketNameEnv] === cloudflare.bucketName, `${cloudflare.bucketNameEnv} matches the pinned bucket`);
}

for (const message of checks) console.log(`PASS: ${message}`);
if (failures.length) {
  for (const message of failures) console.error(`FAIL: ${message}`);
  fail(`Repository identity check failed in ${mode} mode with ${failures.length} error(s).`);
}

console.log(`Repository identity check passed in ${mode} mode.`);
