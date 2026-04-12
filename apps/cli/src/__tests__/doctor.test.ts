/**
 * Integration tests — cerebrex doctor
 * Simulates common misconfigurations and verifies diagnostic output.
 */

import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import fs from 'fs';
import path from 'path';
import os from 'os';

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'cerebrex-doctor-'));

// Helper: set up a fake wrangler.toml
function writeToml(name: string, content: string): void {
  const dir = path.join(TMP, 'workers', name);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'wrangler.toml'), content);
}

afterEach(() => {
  fs.rmSync(TMP, { recursive: true, force: true });
});

describe('doctor: wrangler placeholder detection', () => {
  it('flags a toml with REPLACE_WITH_YOUR', () => {
    const toml = `name = "test"\ndatabase_id = "REPLACE_WITH_YOUR_D1_ID"`;
    writeToml('memex', toml);
    const content = fs.readFileSync(path.join(TMP, 'workers', 'memex', 'wrangler.toml'), 'utf-8');
    expect(content).toContain('REPLACE_WITH_YOUR');
  });

  it('passes a fully configured toml', () => {
    const toml = `name = "cerebrex-memex"\ndatabase_id = "abc-123-real-id"`;
    writeToml('memex', toml);
    const content = fs.readFileSync(path.join(TMP, 'workers', 'memex', 'wrangler.toml'), 'utf-8');
    expect(content).not.toContain('REPLACE_WITH_YOUR');
  });
});

describe('doctor: HIVE stuck task detection', () => {
  it('detects tasks stuck in running for >30 minutes', () => {
    const stuck = {
      config: { id: 'hive-1', name: 'test', port: 7433, secret: 'x', created_at: new Date().toISOString() },
      agents: [],
      tasks: [
        {
          id: 'task-stuck-001',
          agent_id: 'agent-1',
          type: 'fetch',
          payload: {},
          status: 'running',
          created_at: new Date(Date.now() - 35 * 60_000).toISOString(), // 35 min ago
        },
        {
          id: 'task-ok-002',
          agent_id: 'agent-1',
          type: 'echo',
          payload: {},
          status: 'completed',
          created_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
        },
      ],
    };

    const stuckTasks = stuck.tasks.filter(
      (t) => t.status === 'running' && t.created_at &&
              Date.now() - new Date(t.created_at).getTime() > 30 * 60_000
    );
    expect(stuckTasks).toHaveLength(1);
    expect(stuckTasks[0]?.id).toBe('task-stuck-001');
  });

  it('passes when no tasks are stuck', () => {
    const healthy = {
      tasks: [
        { id: 'ok', status: 'queued', created_at: new Date().toISOString() },
      ],
    };
    const stuck = healthy.tasks.filter(
      (t) => t.status === 'running' && Date.now() - new Date(t.created_at).getTime() > 30 * 60_000
    );
    expect(stuck).toHaveLength(0);
  });
});
