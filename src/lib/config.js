// config: 2-tier config system (project + user prefs).
// Project config (.claude-flow-kit.json) is committed; user prefs (XDG) are not.
// Hand-rolled validation — zero deps philosophy.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';

const xdgConfigHome = process.env.XDG_CONFIG_HOME || join(homedir(), '.config');
export const userConfigPath = join(xdgConfigHome, 'claude-flow-kit', 'config.json');

export const PROJECT_CONFIG_FILE = '.claude-flow-kit.json';
export const projectConfigPath = (cwd) => join(cwd, PROJECT_CONFIG_FILE);

export const VALID_STACKS = ['nextjs', 'node-typescript', 'python', 'go', 'generic'];

const DEFAULTS = {
  user: { version: 1, stack: null, lastUsedAt: null, telemetry: false },
  project: { version: 1, stack: null, preserve: [], skipPlugins: false },
};

// ─── User config ──────────────────────────────────────────

export function readUserConfig() {
  if (!existsSync(userConfigPath)) return { ...DEFAULTS.user };
  try {
    const raw = readFileSync(userConfigPath, 'utf8');
    return validateUser({ ...DEFAULTS.user, ...JSON.parse(raw) });
  } catch {
    return { ...DEFAULTS.user };
  }
}

export function writeUserConfig(patch) {
  const current = readUserConfig();
  const next = validateUser({ ...current, ...patch });
  mkdirSync(dirname(userConfigPath), { recursive: true });
  writeFileSync(userConfigPath, JSON.stringify(next, null, 2) + '\n');
  return next;
}

export function resetUserConfig() {
  if (existsSync(userConfigPath)) {
    const fs = require('node:fs');
    fs.unlinkSync(userConfigPath);
  }
}

// ─── Project config ───────────────────────────────────────

export function readProjectConfig(cwd) {
  const path = projectConfigPath(cwd);
  if (!existsSync(path)) return { ...DEFAULTS.project };
  try {
    const raw = readFileSync(path, 'utf8');
    return validateProject({ ...DEFAULTS.project, ...JSON.parse(raw) });
  } catch {
    return { ...DEFAULTS.project };
  }
}

export function writeProjectConfig(cwd, patch) {
  const current = readProjectConfig(cwd);
  const next = validateProject({ ...current, ...patch });
  writeFileSync(projectConfigPath(cwd), JSON.stringify(next, null, 2) + '\n');
  return next;
}

// ─── Validation (typeof-based, no zod) ────────────────────

function validateUser(c) {
  if (typeof c.version !== 'number') c.version = 1;
  if (c.stack !== null && !VALID_STACKS.includes(c.stack)) c.stack = null;
  if (c.lastUsedAt !== null && typeof c.lastUsedAt !== 'string') c.lastUsedAt = null;
  if (typeof c.telemetry !== 'boolean') c.telemetry = false;
  return c;
}

function validateProject(c) {
  if (typeof c.version !== 'number') c.version = 1;
  if (c.stack !== null && !VALID_STACKS.includes(c.stack)) c.stack = null;
  if (!Array.isArray(c.preserve)) c.preserve = [];
  c.preserve = c.preserve.filter((p) => typeof p === 'string');
  if (typeof c.skipPlugins !== 'boolean') c.skipPlugins = false;
  return c;
}

// Shim for code paths that still use require() (node ESM cannot import fs.unlinkSync sync).
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
