/**
 * CerebreX Benchmark Stats
 * Percentile calculations and timing helpers using performance.now()
 */

import type { BenchmarkOptions, BenchmarkResult, LatencyStats } from './types.js';

export function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(idx);
  const upper = Math.ceil(idx);
  if (lower === upper) return sorted[lower] ?? 0;
  const frac = idx - lower;
  return (sorted[lower] ?? 0) * (1 - frac) + (sorted[upper] ?? 0) * frac;
}

export function computeStats(samples: number[]): LatencyStats {
  if (samples.length === 0) {
    return { min: 0, max: 0, mean: 0, stddev: 0, p50: 0, p95: 0, p99: 0 };
  }
  const sorted = [...samples].sort((a, b) => a - b);
  const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
  const variance = samples.reduce((acc, v) => acc + (v - mean) ** 2, 0) / samples.length;
  return {
    min: sorted[0] ?? 0,
    max: sorted[sorted.length - 1] ?? 0,
    mean,
    stddev: Math.sqrt(variance),
    p50: percentile(sorted, 50),
    p95: percentile(sorted, 95),
    p99: percentile(sorted, 99),
  };
}

export interface RunOptions {
  name: string;
  suite: string;
  options?: BenchmarkOptions;
  fn: () => Promise<void> | void;
}

export async function benchmark(opts: RunOptions): Promise<BenchmarkResult> {
  const {
    iterations = 20,
    warmupRuns = 3,
    timeout = 10_000,
    metadata = {},
  } = opts.options ?? {};

  const latencySamples: number[] = [];
  let errorCount = 0;

  // Warmup
  for (let i = 0; i < warmupRuns; i++) {
    try { await withTimeout(opts.fn, timeout); } catch { /* warmup errors ignored */ }
  }

  // Measured iterations
  for (let i = 0; i < iterations; i++) {
    const t0 = performance.now();
    try {
      await withTimeout(opts.fn, timeout);
      latencySamples.push(performance.now() - t0);
    } catch {
      errorCount++;
      latencySamples.push(performance.now() - t0);
    }
  }

  const latency = computeStats(latencySamples);
  const successCount = iterations - errorCount;
  const totalMs = latencySamples.reduce((a, b) => a + b, 0);

  return {
    name: opts.name,
    suite: opts.suite,
    iterations,
    warmupRuns,
    latency,
    successRate: successCount / iterations,
    errorCount,
    memoryDeltaBytes: null,
    tokenCount: null,
    costEstimateUsd: null,
    throughputOpsPerSec: totalMs > 0 ? (successCount / totalMs) * 1000 : 0,
    timestamp: new Date().toISOString(),
    metadata,
  };
}

async function withTimeout<T>(fn: () => Promise<T> | T, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Benchmark timed out after ${ms}ms`)), ms);
    Promise.resolve(fn()).then(
      (v) => { clearTimeout(timer); resolve(v); },
      (e) => { clearTimeout(timer); reject(e as Error); }
    );
  });
}
