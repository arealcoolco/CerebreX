/**
 * CerebreX Benchmark JSON Reporter
 */

import fs from 'fs';
import path from 'path';
import type { BenchmarkSuite } from '../types.js';

export function toJson(suite: BenchmarkSuite, pretty = true): string {
  return JSON.stringify(suite, null, pretty ? 2 : 0);
}

export function writeJson(suite: BenchmarkSuite, outPath: string): void {
  const dir = path.dirname(outPath);
  if (dir && dir !== '.') fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(outPath, toJson(suite));
  console.log(`Benchmark results written to ${outPath}`);
}
