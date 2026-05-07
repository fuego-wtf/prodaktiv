import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const sourceTargets = [
  'App.tsx',
  'README.md',
  '.env.example',
  'bun.lock',
  'components',
  'hooks',
  'index.html',
  'package.json',
  'services',
  'types.ts',
  'vite.config.ts',
];

const distTargets = ['dist'];

const forbidden = [
  'GEMINI_API_KEY',
  'process.env.API_KEY',
  '@google/genai',
  'GoogleGenAI',
  'gemini-3',
  'Gemini',
];

const ignoredDirs = new Set(['node_modules', '.git']);
const findings = [];

const walk = (entry) => {
  if (!existsSync(entry)) return [];

  const stats = statSync(entry);
  if (stats.isFile()) return [entry];

  return readdirSync(entry).flatMap((name) => {
    if (ignoredDirs.has(name)) return [];
    return walk(path.join(entry, name));
  });
};

const scanFile = (file, scope) => {
  const content = readFileSync(file, 'utf8');
  const relative = path.relative(root, file);

  for (const token of forbidden) {
    if (content.includes(token)) {
      findings.push(`${scope}: ${relative} contains ${token}`);
    }
  }
};

for (const target of sourceTargets) {
  for (const file of walk(path.join(root, target))) {
    scanFile(file, 'source');
  }
}

for (const target of distTargets) {
  for (const file of walk(path.join(root, target))) {
    scanFile(file, 'dist');
  }
}

if (findings.length > 0) {
  console.error('Client AI/security check failed:');
  for (const finding of findings) {
    console.error(`- ${finding}`);
  }
  process.exit(1);
}

console.log('Client AI/security check passed: no Gemini client path or API-key injection strings found.');
