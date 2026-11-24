import {execFileSync} from 'node:child_process';
import {cpSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const work = mkdtempSync(path.join(os.tmpdir(), 'shadowslayers-dashboard-'));
const output = path.join(root, 'public', 'shadow-slayers', 'dashboard');
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

try {
  execFileSync('git', [
    'clone', '--depth', '1', '--branch', 'main',
    'https://github.com/Wolfyslayer/ShadowSlayers-Bot.git', work,
  ], {stdio: 'inherit', env: {...process.env, GIT_TERMINAL_PROMPT: '0'}});
  execFileSync(npm, ['ci', '--no-audit', '--no-fund'], {cwd: work, stdio: 'inherit'});
  execFileSync(npm, ['run', 'build:dashboard'], {
    cwd: work,
    stdio: 'inherit',
    env: {
      ...process.env,
      VITE_BASE_PATH: '/shadow-slayers/dashboard/',
      VITE_API_BASE_URL: process.env.VITE_API_BASE_URL || 'https://shadowslayers-api-vloo4dmzfa-ez.a.run.app',
    },
  });
  rmSync(output, {recursive: true, force: true});
  mkdirSync(path.dirname(output), {recursive: true});
  cpSync(path.join(work, 'dist'), output, {recursive: true});
  const dashboardHtml = path.join(output, 'index.html');
  const html = readFileSync(dashboardHtml, 'utf8');
  if (!html.includes('name=\"robots\"')) {
    writeFileSync(dashboardHtml, html.replace('</head>', '  <meta name=\"robots\" content=\"noindex,nofollow\" />\\n  </head>'));
  }
  console.log('PASS: ShadowSlayers dashboard built for /shadow-slayers/dashboard/');
} finally {
  rmSync(work, {recursive: true, force: true});
}
