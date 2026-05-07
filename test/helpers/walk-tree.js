// Helper: recursively list files in a directory, sorted, with relative paths.
import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

export function walkTree(root) {
  const out = [];
  function recurse(dir) {
    for (const entry of readdirSync(dir).sort()) {
      const full = join(dir, entry);
      const rel = relative(root, full);
      const s = statSync(full);
      if (s.isDirectory()) {
        out.push(`${rel}/`);
        recurse(full);
      } else if (s.isFile()) {
        out.push(rel);
      } else if (s.isSymbolicLink()) {
        out.push(`${rel} -> [symlink]`);
      }
    }
  }
  recurse(root);
  return out;
}
