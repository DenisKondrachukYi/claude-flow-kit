// Stack detection and settings application
import { existsSync, readFileSync, copyFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const MARKERS = {
  nextjs: ({ dir, files }) =>
    files.has('next.config.js') ||
    files.has('next.config.mjs') ||
    files.has('next.config.ts'),
  'node-typescript': ({ dir, files }) => {
    if (!files.has('package.json')) return false;
    try {
      const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
      return Boolean(
        pkg.devDependencies?.typescript ||
        pkg.dependencies?.typescript ||
        files.has('tsconfig.json')
      );
    } catch {
      return false;
    }
  },
  python: ({ files }) =>
    files.has('pyproject.toml') ||
    files.has('setup.py') ||
    files.has('requirements.txt'),
  go: ({ files }) => files.has('go.mod'),
};

const ORDER = ['nextjs', 'node-typescript', 'python', 'go'];

export function detectStack(dir) {
  if (!existsSync(dir)) return 'generic';
  const files = new Set(readdirSync(dir));
  for (const name of ORDER) {
    if (MARKERS[name]({ dir, files })) return name;
  }
  return 'generic';
}

export function applyStackSettings(targetDir, stack) {
  const variantsDir = join(targetDir, '.claude', 'settings-variants');
  const settingsFile = join(targetDir, '.claude', 'settings.json');
  const variant = join(variantsDir, `${stack}.json`);
  if (!existsSync(variant)) return false;
  copyFileSync(variant, settingsFile);
  return true;
}
