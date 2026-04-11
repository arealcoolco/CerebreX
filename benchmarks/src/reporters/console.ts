/**
 * CerebreX Benchmark Console Reporter
 */

import type { BenchmarkResult, BenchmarkSuite } from '../types.js';

const RESET  = '\x1b[0m';
const CYAN   = '\x1b[36m';
const GREEN  = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED    = '\x1b[31m';
const DIM    = '\x1b[2m';
const BOLD   = '\x1b[1m';

function fmt(n: number, unit = 'ms'): string {
  return `${n.toFixed(2)}${unit}`;
}

function successColor(rate: number): string {
  if (rate >= 0.99) return GREEN;
  if (rate >= 0.90) return YELLOW;
  return RED;
}

export function printResult(r: BenchmarkResult): void {
  const sc = successColor(r.successRate);
  console.log(`\n  ${BOLD}${CYAN}${r.name}${RESET} ${DIM}[${r.suite}]${RESET}`);
  console.log(`  ${DIM}iterations:${RESET} ${r.iterations}  ${DIM}warmup:${RESET} ${r.warmupRuns}`);
  console.log(
    `  ${DIM}latency —${RESET}` +
    `  p50: ${fmt(r.latency.p50)}` +
    `  p95: ${fmt(r.latency.p95)}` +
    `  p99: ${fmt(r.latency.p99)}` +
    `  mean: ${fmt(r.latency.mean)}` +
    `  min: ${fmt(r.latency.min)}` +
    `  max: ${fmt(r.latency.max)}`
  );
  console.log(
    `  ${DIM}throughput:${RESET} ${r.throughputOpsPerSec.toFixed(1)} ops/s` +
    `  ${DIM}success:${RESET} ${sc}${(r.successRate * 100).toFixed(1)}%${RESET}` +
    (r.errorCount > 0 ? `  ${RED}errors: ${r.errorCount}${RESET}` : '')
  );
  if (r.tokenCount !== null) {
    console.log(`  ${DIM}tokens:${RESET} ${r.tokenCount}` +
      (r.costEstimateUsd !== null ? `  ${DIM}cost:${RESET} $${r.costEstimateUsd.toFixed(4)}` : ''));
  }
  if (Object.keys(r.metadata).length > 0) {
    console.log(`  ${DIM}metadata:${RESET} ${JSON.stringify(r.metadata)}`);
  }
}

export function printSuite(suite: BenchmarkSuite): void {
  console.log(`\n${BOLD}${CYAN}CerebreX Benchmark Suite — ${suite.name}${RESET}`);
  console.log(`${DIM}run at: ${suite.runAt}  duration: ${(suite.totalDurationMs / 1000).toFixed(2)}s${RESET}`);
  console.log(`${DIM}platform: ${suite.environment.platform}  runtime: ${suite.environment.runtime}  cpus: ${suite.environment.cpuCores}${RESET}`);
  console.log(`${DIM}${'─'.repeat(72)}${RESET}`);
  for (const r of suite.results) {
    printResult(r);
  }
  console.log(`\n${DIM}${'─'.repeat(72)}${RESET}`);
  const total = suite.results.length;
  const passed = suite.results.filter((r) => r.successRate >= 0.95).length;
  const avgP95 = suite.results.reduce((a, r) => a + r.latency.p95, 0) / total;
  console.log(`${BOLD}Summary:${RESET} ${passed}/${total} benchmarks at >=95% success  avg p95: ${fmt(avgP95)}\n`);
}
