// status: invoke the embedded bash dashboard (works in any installed project)
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { c } from './print.js';

export async function runStatus({ flags }) {
  // Walk up to find .claude/scripts/status.sh
  let dir = process.cwd();
  while (dir !== '/' && dir !== '') {
    const candidate = join(dir, '.claude', 'scripts', 'status.sh');
    if (existsSync(candidate)) {
      try {
        const args = flags.verbose ? ['-v'] : [];
        execFileSync('bash', [candidate, ...args], { stdio: 'inherit', cwd: dir });
        return 0;
      } catch (err) {
        return err.status ?? 1;
      }
    }
    const parent = join(dir, '..');
    if (parent === dir) break;
    dir = parent;
  }
  process.stdout.write(`${c.yellow('⚠')} No .claude/scripts/status.sh found.\n`);
  process.stdout.write(`Run ${c.cyan('cfk init')} or ${c.cyan('npx claude-flow-kit init')} first.\n`);
  return 1;
}
