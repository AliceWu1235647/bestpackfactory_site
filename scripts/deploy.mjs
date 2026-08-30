import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.resolve(scriptDirectory, '..');
const isWindows = process.platform === 'win32';
const npmCommand = isWindows ? 'npm.cmd' : 'npm';
const vercelCommand = isWindows ? 'vercel.cmd' : 'vercel';
const argumentsList = process.argv.slice(2);
const supportedArguments = new Set([
  '--prod',
  '--dry-run',
  '--skip-install',
  '--allow-missing-email',
  '--help',
]);

function printHelp() {
  console.log(`BestPack Factory deployment helper

Usage:
  node scripts/deploy.mjs [options]

Options:
  --prod                 Deploy to the linked Vercel production project
  --dry-run              Run production checks and build without deploying
  --skip-install         Skip npm dependency installation
  --allow-missing-email  Allow deployment without complete SMTP configuration
  --help                 Show this help message

Examples:
  npm run deploy:check
  npm run deploy:dry-run
  npm run deploy
`);
}

function fail(message, exitCode = 1) {
  console.error(`\n❌ ${message}`);
  process.exit(exitCode);
}

function stripAnsi(value) {
  return value.replace(/\u001B\[[0-?]*[ -\/]*[@-~]/g, '');
}

function run(command, args, { capture = false } = {}) {
  console.log(`\n> ${command} ${args.join(' ')}`);

  const result = spawnSync(command, args, {
    cwd: projectDirectory,
    env: {
      ...process.env,
      NO_COLOR: '1',
      NEXT_TELEMETRY_DISABLED: '1',
    },
    shell: isWindows,
    encoding: capture ? 'utf8' : undefined,
    stdio: capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
  });

  if (capture) {
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
  }

  if (result.error) {
    fail(`Unable to run ${command}: ${result.error.message}`);
  }

  if (result.status !== 0) {
    fail(`${command} exited with code ${result.status ?? 'unknown'}.`);
  }

  return `${result.stdout || ''}\n${result.stderr || ''}`;
}

function commandExists(command) {
  const lookupCommand = isWindows ? 'where.exe' : 'command';
  const lookupArguments = isWindows ? [command] : ['-v', command];
  const result = spawnSync(lookupCommand, lookupArguments, {
    cwd: projectDirectory,
    shell: !isWindows,
    stdio: 'ignore',
  });

  return result.status === 0;
}

function readVercelEnvironmentNames(output) {
  const normalizedOutput = stripAnsi(output);
  const names = new Set();

  for (const line of normalizedOutput.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z][A-Z0-9_]*)\s+/);
    if (match) names.add(match[1]);
  }

  return names;
}

for (const argument of argumentsList) {
  if (!supportedArguments.has(argument)) {
    fail(`Unknown option: ${argument}. Run with --help to see supported options.`);
  }
}

if (argumentsList.includes('--help')) {
  printHelp();
  process.exit(0);
}

const deployToProduction = argumentsList.includes('--prod');
const dryRun = argumentsList.includes('--dry-run');
const skipInstall = argumentsList.includes('--skip-install');
const allowMissingEmail = argumentsList.includes('--allow-missing-email');

console.log('🚀 Starting BestPack Factory deployment checks...');

const nodeMajorVersion = Number(process.versions.node.split('.')[0]);
if (!Number.isFinite(nodeMajorVersion) || nodeMajorVersion < 20) {
  fail(`Node.js 20 or newer is required. Current version: ${process.versions.node}`);
}

const packageJsonPath = path.join(projectDirectory, 'package.json');
if (!existsSync(packageJsonPath)) {
  fail(`package.json was not found in ${projectDirectory}.`);
}

const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
console.log(`✅ Project: ${packageJson.name || 'bestpackfactory-site'}`);
console.log(`✅ Node.js: ${process.versions.node}`);

if (deployToProduction) {
  const vercelProjectPath = path.join(projectDirectory, '.vercel', 'project.json');
  if (!existsSync(vercelProjectPath)) {
    fail('This folder is not linked to Vercel. Run "vercel link" first.');
  }

  if (!commandExists(vercelCommand)) {
    fail('Vercel CLI was not found. Install it with "npm install --global vercel".');
  }

  console.log('\n🔎 Checking Vercel Production environment variables...');
  const environmentOutput = run(vercelCommand, ['env', 'ls', 'production'], {
    capture: true,
  });
  const environmentNames = readVercelEnvironmentNames(environmentOutput);
  const requiredEmailVariables = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM'];
  const missingEmailVariables = requiredEmailVariables.filter(
    (name) => !environmentNames.has(name),
  );

  if (missingEmailVariables.length > 0) {
    const missingList = missingEmailVariables.join(', ');
    if (!allowMissingEmail) {
      fail(
        `Production email configuration is incomplete: ${missingList}. ` +
          'Add these variables in Vercel, or deliberately bypass this safeguard with --allow-missing-email.',
        2,
      );
    }
    console.warn(`⚠️ Continuing without complete email configuration: ${missingList}`);
  } else {
    console.log('✅ Required Production email environment variables are configured.');
  }

  if (!environmentNames.has('CONTACT_TO_EMAIL') && !environmentNames.has('CONTACT_EMAIL')) {
    console.warn('ℹ️ No contact recipient variable is configured; inquiries will use the built-in Lisa Wu address.');
  }

  if (!environmentNames.has('OPENAI_API_KEY')) {
    console.warn('⚠️ OPENAI_API_KEY is not configured; the AI chatbot may use its fallback behavior.');
  }
}

if (!skipInstall) {
  const hasPackageLock = existsSync(path.join(projectDirectory, 'package-lock.json'));
  console.log(`\n📦 Installing dependencies with ${hasPackageLock ? 'npm ci' : 'npm install'}...`);
  run(npmCommand, hasPackageLock ? ['ci'] : ['install']);
} else {
  console.log('\n⏭️ Dependency installation skipped.');
}

console.log('\n🔨 Generating sitemaps and building the project...');
console.log('\nRunning traffic and technical SEO checks...');
run(npmCommand, ['run', 'traffic:check']);
run(npmCommand, ['run', 'build']);
console.log('\n✅ Production build completed successfully.');

if (!deployToProduction) {
  console.log('ℹ️ No deployment was requested. Run "npm run deploy" when ready.');
  process.exit(0);
}

if (dryRun) {
  console.log('🧪 Dry run completed. Nothing was deployed to Vercel.');
  process.exit(0);
}

console.log('\n🚀 Deploying the verified build to Vercel Production...');
run(vercelCommand, ['--prod', '--yes']);
console.log('\n🎉 BestPack Factory was deployed successfully.');
