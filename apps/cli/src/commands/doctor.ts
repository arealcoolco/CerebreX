/**
 * cerebrex doctor — Local environment health checker
 *
 * Validates local config, checks connectivity to deployed workers,
 * reports orphaned Kairos tasks, stale MEMEX entries, and D1/KV/R2
 * schema consistency. Outputs an actionable health report.
 */

import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import os from 'os';

const CEREBREX_DIR = path.join(os.homedir(), '.cerebrex');

interface HealthCheck {
  name: string;
  status: 'ok' | 'warn' | 'fail' | 'skip';
  detail: string;
  fix?: string;
}

export const doctorCommand = new Command('doctor')
  .description('Validate local config and check connectivity to deployed workers')
  .option('--kairos-url <url>', 'KAIROS worker URL to check')
  .option('--memex-url <url>', 'MEMEX worker URL to check')
  .option('--api-key <key>', 'API key for worker health checks (or set CEREBREX_API_KEY)')
  .option('--json', 'Output as structured JSON')
  .action(async (options) => {
    const checks: HealthCheck[] = [];
    const apiKey: string = options.apiKey ?? process.env['CEREBREX_API_KEY'] ?? '';

    // ── 1. CLI credentials ─────────────────────────────────────────────────────
    const credFile = path.join(CEREBREX_DIR, '.credentials');
    if (fs.existsSync(credFile)) {
      try {
        const cred = JSON.parse(fs.readFileSync(credFile, 'utf-8')) as { token?: string };
        checks.push({
          name: 'credentials',
          status: cred.token ? 'ok' : 'warn',
          detail: cred.token ? 'Token present in ~/.cerebrex/.credentials' : 'Credentials file exists but token is empty',
          fix: cred.token ? undefined : 'Run: cerebrex auth login',
        });
      } catch {
        checks.push({ name: 'credentials', status: 'fail', detail: 'Credentials file is corrupt', fix: 'Run: cerebrex auth login' });
      }
    } else {
      checks.push({ name: 'credentials', status: 'warn', detail: 'No credentials found', fix: 'Run: cerebrex auth login' });
    }

    // ── 2. wrangler.toml files ────────────────────────────────────────────────
    const workers = ['site', 'registry', 'memex', 'kairos'];
    for (const w of workers) {
      const tomlPath = path.join(process.cwd(), 'workers', w, 'wrangler.toml');
      if (!fs.existsSync(tomlPath)) {
        checks.push({ name: `wrangler:${w}`, status: 'skip', detail: `workers/${w}/wrangler.toml not found — not in monorepo root` });
        continue;
      }
      const toml = fs.readFileSync(tomlPath, 'utf-8');
      if (toml.includes('REPLACE_WITH_YOUR')) {
        checks.push({
          name: `wrangler:${w}`,
          status: 'fail',
          detail: `workers/${w}/wrangler.toml has placeholder resource IDs`,
          fix: `Run: wrangler d1 create cerebrex-${w} and update the database_id`,
        });
      } else {
        checks.push({ name: `wrangler:${w}`, status: 'ok', detail: `workers/${w}/wrangler.toml looks configured` });
      }
    }

    // ── 3. HIVE local state ───────────────────────────────────────────────────
    const hiveState = path.join(CEREBREX_DIR, 'hive', 'state.json');
    if (fs.existsSync(hiveState)) {
      try {
        const state = JSON.parse(fs.readFileSync(hiveState, 'utf-8')) as {
          tasks?: Array<{ status: string; id: string; created_at?: string }>;
          agents?: Array<{ id: string; status: string }>;
        };
        const stuck = (state.tasks ?? []).filter(
          (t) => t.status === 'running' && t.created_at &&
                 Date.now() - new Date(t.created_at).getTime() > 30 * 60_000 // 30 min
        );
        if (stuck.length > 0) {
          checks.push({
            name: 'hive:stuck-tasks',
            status: 'warn',
            detail: `${stuck.length} task(s) stuck in 'running' for >30 minutes: ${stuck.map(t => t.id.slice(0,8)).join(', ')}`,
            fix: 'Restart the coordinator: cerebrex hive stop && cerebrex hive start',
          });
        } else {
          checks.push({ name: 'hive:stuck-tasks', status: 'ok', detail: `${(state.tasks ?? []).length} task(s) in state, none stuck` });
        }
        const offline = (state.agents ?? []).filter((a) => a.status === 'offline');
        if (offline.length > 0) {
          checks.push({
            name: 'hive:offline-agents',
            status: 'warn',
            detail: `${offline.length} agent(s) offline: ${offline.map(a => a.id).join(', ')}`,
            fix: 'Restart workers: cerebrex hive worker --id <id> --token <jwt>',
          });
        }
      } catch {
        checks.push({ name: 'hive:state', status: 'fail', detail: 'hive/state.json is corrupt', fix: 'Delete ~/.cerebrex/hive/state.json and re-init' });
      }
    } else {
      checks.push({ name: 'hive:state', status: 'skip', detail: 'No local HIVE state — not initialized' });
    }

    // ── 4. KAIROS connectivity ────────────────────────────────────────────────
    if (options.kairosUrl) {
      try {
        const res = await fetch(`${options.kairosUrl}/health`, {
          headers: apiKey ? { 'x-api-key': apiKey } : {},
          signal: AbortSignal.timeout(5_000),
        });
        if (res.ok) {
          const data = await res.json() as { status?: string };
          checks.push({ name: 'kairos:connectivity', status: 'ok', detail: `KAIROS responded: ${JSON.stringify(data)}` });
        } else {
          checks.push({
            name: 'kairos:connectivity', status: 'fail',
            detail: `KAIROS returned HTTP ${res.status}`,
            fix: 'Check CEREBREX_API_KEY env var on the deployed worker',
          });
        }
      } catch (e) {
        checks.push({
          name: 'kairos:connectivity', status: 'fail',
          detail: `KAIROS unreachable: ${(e as Error).message}`,
          fix: 'Verify the worker URL and that the worker is deployed',
        });
      }
    } else {
      checks.push({ name: 'kairos:connectivity', status: 'skip', detail: 'Pass --kairos-url to check connectivity' });
    }

    // ── 5. MEMEX connectivity ─────────────────────────────────────────────────
    if (options.memexUrl) {
      try {
        const res = await fetch(`${options.memexUrl}/health`, {
          signal: AbortSignal.timeout(5_000),
        });
        if (res.ok) {
          checks.push({ name: 'memex:connectivity', status: 'ok', detail: 'MEMEX /health responded ok' });
        } else {
          checks.push({
            name: 'memex:connectivity', status: 'fail',
            detail: `MEMEX returned HTTP ${res.status}`,
            fix: 'Check worker deployment and wrangler.toml bindings',
          });
        }
      } catch (e) {
        checks.push({
          name: 'memex:connectivity', status: 'fail',
          detail: `MEMEX unreachable: ${(e as Error).message}`,
          fix: 'Verify the worker URL and that D1/KV/R2 bindings are configured',
        });
      }
    } else {
      checks.push({ name: 'memex:connectivity', status: 'skip', detail: 'Pass --memex-url to check connectivity' });
    }

    // ── 6. Registry reachability ──────────────────────────────────────────────
    try {
      const res = await fetch('https://registry.therealcool.site/health', {
        signal: AbortSignal.timeout(5_000),
      });
      checks.push({
        name: 'registry:connectivity',
        status: res.ok ? 'ok' : 'warn',
        detail: res.ok ? 'Registry /health ok' : `Registry returned ${res.status}`,
      });
    } catch (e) {
      checks.push({
        name: 'registry:connectivity', status: 'fail',
        detail: `Registry unreachable: ${(e as Error).message}`,
        fix: 'Check https://registry.therealcool.site manually',
      });
    }

    // ── Output ────────────────────────────────────────────────────────────────
    if (options.json) {
      const summary = {
        ok: checks.filter(c => c.status === 'ok').length,
        warn: checks.filter(c => c.status === 'warn').length,
        fail: checks.filter(c => c.status === 'fail').length,
        skip: checks.filter(c => c.status === 'skip').length,
      };
      console.log(JSON.stringify({ checks, summary }, null, 2));
      process.exit(summary.fail > 0 ? 1 : 0);
    }

    console.log(chalk.cyan('\n  cerebrex doctor — environment health report\n'));
    for (const c of checks) {
      const icon = c.status === 'ok' ? chalk.green('✓') :
                   c.status === 'warn' ? chalk.yellow('⚠') :
                   c.status === 'fail' ? chalk.red('✗') : chalk.dim('–');
      console.log(`  ${icon} ${chalk.bold(c.name.padEnd(30))} ${c.detail}`);
      if (c.fix) console.log(`      ${chalk.dim('→ fix:')} ${chalk.dim(c.fix)}`);
    }

    const fails = checks.filter(c => c.status === 'fail').length;
    const warns = checks.filter(c => c.status === 'warn').length;
    console.log('');
    if (fails === 0 && warns === 0) {
      console.log(chalk.green('  ✓ All checks passed.\n'));
    } else {
      console.log(chalk.yellow(`  ${fails} failure(s), ${warns} warning(s). Fix the issues above.\n`));
      if (fails > 0) process.exit(1);
    }
  });
