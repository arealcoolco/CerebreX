#!/usr/bin/env bun
/**
 * CerebreX Benchmark Runner
 * Entry point for `bun benchmarks/src/runner.ts [suite] [--reporter json|markdown|console] [--out path]`
 */

import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const args = process.argv.slice(2);
const suite = args[0] ?? 'all';
const reporterIdx = args.indexOf('--reporter');
const outIdx = args.indexOf('--out');
const reporter = reporterIdx !== -1 ? (args[reporterIdx + 1] ?? 'console') : 'console';
const outFile = outIdx !== -1 ? (args[outIdx + 1] ?? '') : '';

const SUITES: Record<string, string> = {
  forge:    'forge-bench.ts',
  trace:    'trace-bench.ts',
  memex:    'memex-bench.ts',
  hive:     'hive-bench.ts',
  registry: 'registry-bench.ts',
  agents:   'agent-tasks-bench.ts',
};

function run(file: string): void {
  const fullPath = path.join(ROOT, file);
  console.log(`\nRunning ${file}...`);
  const result = spawnSync('bun', [fullPath], {
    stdio: 'inherit',
    env: { ...process.env },
    cwd: ROOT,
  });
  if (result.status !== 0) {
    console.error(`Benchmark ${file} exited with code ${result.status ?? 'unknown'}`);
  }
}

if (suite === 'all') {
  for (const file of Object.values(SUITES)) {
    run(file);
  }
} else if (SUITES[suite]) {
  run(SUITES[suite]!);
} else {
  console.error(`Unknown suite: ${suite}`);
  console.error(`Available: ${Object.keys(SUITES).join(', ')}, all`);
  process.exit(1);
}

if (reporter === 'json' && outFile) {
  console.log(`\nNote: per-suite JSON output is written by individual benchmarks.`);
  console.log(`To collect results, run with BENCH_OUT=${outFile} set and update reporters.`);
}
