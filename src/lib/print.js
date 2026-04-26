// ANSI color helpers — works without dependencies
const supportsColor = process.stdout.isTTY && process.env.NO_COLOR !== '1';

function wrap(open, close) {
  return supportsColor ? (s) => `\x1b[${open}m${s}\x1b[${close}m` : (s) => s;
}

export const c = {
  bold: wrap(1, 22),
  dim: wrap(2, 22),
  red: wrap(31, 39),
  green: wrap(32, 39),
  yellow: wrap(33, 39),
  blue: wrap(34, 39),
  cyan: wrap(36, 39),
  gray: wrap(90, 39),
};

export function banner(text) {
  process.stdout.write(`\n${c.bold('▶ ' + text)}\n`);
}

export function hr() {
  process.stdout.write(c.dim('─────────────────────────────────────────────────\n'));
}

export function ok(msg) {
  process.stdout.write(`  ${c.green('✓')} ${msg}\n`);
}

export function warn(msg) {
  process.stdout.write(`  ${c.yellow('⚠')} ${msg}\n`);
}

export function fail(msg) {
  process.stdout.write(`  ${c.red('✗')} ${msg}\n`);
}

export function info(msg) {
  process.stdout.write(`  ${msg}\n`);
}
