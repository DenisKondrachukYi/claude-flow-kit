// update-notifier: zero-dep "newer version available" banner.
// Pattern adapted from yeoman/update-notifier and expo-cli, but with no deps.

import { request } from 'node:https';
import { c } from './print.js';
import { readUserConfig, writeUserConfig } from './config.js';

const REGISTRY = 'https://registry.npmjs.org/claude-flow-kit/latest';
const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24h
const FETCH_TIMEOUT_MS = 1500;

/**
 * Check if a newer version is available; print a non-blocking banner if yes.
 * Never throws — failure paths are silently ignored to avoid CLI breakage.
 *
 * @param {string} currentVersion  package.json version
 * @param {object} options
 * @param {boolean} options.disable  caller-side opt-out (e.g. --no-update-check)
 */
export async function checkForUpdates(currentVersion, options = {}) {
  if (shouldSkip(options.disable)) return;

  let cfg;
  try {
    cfg = readUserConfig();
  } catch {
    return; // Config unreadable, abort silently.
  }

  const lastChecked = cfg.lastUpdateCheck ? new Date(cfg.lastUpdateCheck).getTime() : 0;
  const cachedLatest = cfg.latestKnownVersion;
  const now = Date.now();

  let latest = cachedLatest;
  if (!cachedLatest || now - lastChecked > CHECK_INTERVAL_MS) {
    latest = await fetchLatestVersion();
    if (!latest) return; // network failure, no banner
    try {
      writeUserConfig({
        lastUpdateCheck: new Date(now).toISOString(),
        latestKnownVersion: latest,
      });
    } catch {
      // Non-fatal.
    }
  }

  if (latest && isNewer(latest, currentVersion)) {
    printBanner(currentVersion, latest);
  }
}

function shouldSkip(disabledByFlag) {
  if (disabledByFlag) return true;
  if (process.env.NO_UPDATE_NOTIFIER === '1' || process.env.NO_UPDATE_NOTIFIER === 'true') return true;
  if (process.env.CI === 'true' || process.env.CI === '1') return true;
  if (!process.stdout.isTTY) return true;
  return false;
}

function fetchLatestVersion() {
  return new Promise((resolve) => {
    const req = request(REGISTRY, { method: 'GET', timeout: FETCH_TIMEOUT_MS }, (res) => {
      if (res.statusCode !== 200) {
        res.resume();
        resolve(null);
        return;
      }
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        body += chunk;
        if (body.length > 50_000) {
          req.destroy();
          resolve(null);
        }
      });
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve(typeof json.version === 'string' ? json.version : null);
        } catch {
          resolve(null);
        }
      });
    });
    req.on('timeout', () => {
      req.destroy();
      resolve(null);
    });
    req.on('error', () => resolve(null));
    req.end();
  });
}

/**
 * Compare two semver-like strings (no prerelease support — that's fine for cfk).
 */
export function isNewer(latest, current) {
  if (!latest || !current) return false;
  const parse = (s) => s.replace(/^v/, '').split(/[.+-]/).map((n) => parseInt(n, 10) || 0);
  const a = parse(latest);
  const b = parse(current);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const ai = a[i] || 0;
    const bi = b[i] || 0;
    if (ai > bi) return true;
    if (ai < bi) return false;
  }
  return false;
}

function printBanner(current, latest) {
  const lines = [
    `Update available: ${c.dim(current)} → ${c.green(latest)}`,
    `Run: ${c.cyan('npm i -g claude-flow-kit')}`,
    `Or:  ${c.cyan('npx claude-flow-kit@latest')}`,
  ];
  const width = Math.max(...lines.map(stripAnsiLength)) + 4;
  const pad = (line) => {
    const visibleLen = stripAnsiLength(line);
    return line + ' '.repeat(width - visibleLen - 4);
  };
  process.stderr.write('\n');
  process.stderr.write(c.yellow(`┌${'─'.repeat(width - 2)}┐`) + '\n');
  for (const line of lines) {
    process.stderr.write(c.yellow('│ ') + pad(line) + c.yellow(' │') + '\n');
  }
  process.stderr.write(c.yellow(`└${'─'.repeat(width - 2)}┘`) + '\n');
  process.stderr.write('\n');
}

function stripAnsiLength(s) {
  return s.replace(/\x1b\[[0-9;]*m/g, '').length;
}
