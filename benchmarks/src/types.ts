/**
 * CerebreX Benchmark Types
 */

export interface LatencyStats {
  min: number;
  max: number;
  mean: number;
  stddev: number;
  p50: number;
  p95: number;
  p99: number;
}

export interface BenchmarkResult {
  name: string;
  suite: string;
  iterations: number;
  warmupRuns: number;
  latency: LatencyStats;
  successRate: number;        // 0.0 - 1.0
  errorCount: number;
  memoryDeltaBytes: number | null;
  tokenCount: number | null;  // estimated tokens if applicable
  costEstimateUsd: number | null;
  throughputOpsPerSec: number;
  timestamp: string;
  metadata: Record<string, unknown>;
}

export interface BenchmarkSuite {
  name: string;
  results: BenchmarkResult[];
  totalDurationMs: number;
  runAt: string;
  environment: {
    platform: string;
    runtime: string;
    cpuCores: number;
  };
}

export interface BenchmarkOptions {
  iterations?: number;       // default 20
  warmupRuns?: number;       // default 3
  timeout?: number;          // ms per iteration, default 10000
  concurrency?: number;      // default 1
  metadata?: Record<string, unknown>;
}

export interface AgentTaskResult {
  taskName: string;
  framework: string;
  latency: LatencyStats;
  successRate: number;
  qualityScore: number | null;   // 0.0 - 1.0 if measurable
  tokenCount: number | null;
  costEstimateUsd: number | null;
  notes: string;
}
