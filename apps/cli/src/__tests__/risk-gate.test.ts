/**
 * Unit tests — risk-gate: aggregateRiskScore, checkVelocity, hasRiskOverride
 */

import { describe, it, expect, beforeEach } from 'bun:test';
import {
  aggregateRiskScore,
  checkVelocity,
  hasRiskOverride,
  type VelocityEntry,
} from '../core/auth/risk-gate.js';

// ── aggregateRiskScore ──────────────────────────────────────────────────────

describe('aggregateRiskScore', () => {
  it('returns score 0 for empty array', () => {
    const { score, requiresQuorum } = aggregateRiskScore([]);
    expect(score).toBe(0);
    expect(requiresQuorum).toBe(false);
  });

  it('low tasks have weight 1 each', () => {
    const { score } = aggregateRiskScore(['echo', 'noop', 'memex-get']);
    expect(score).toBe(3);
  });

  it('medium tasks have weight 3 each', () => {
    const { score } = aggregateRiskScore(['fetch', 'memex-set']);
    expect(score).toBe(6);
  });

  it('high tasks have weight 10 each', () => {
    const { score } = aggregateRiskScore(['delete', 'deploy']);
    expect(score).toBe(20);
  });

  it('requires quorum when score >= 12 (default threshold)', () => {
    // 4 medium-risk tasks = 12 → triggers quorum
    const { requiresQuorum } = aggregateRiskScore(['fetch', 'memex-set', 'write', 'configure']);
    expect(requiresQuorum).toBe(true);
  });

  it('does not require quorum when score < 12', () => {
    // 3 medium = 9 → no quorum
    const { requiresQuorum } = aggregateRiskScore(['fetch', 'memex-set', 'write']);
    expect(requiresQuorum).toBe(false);
  });
});

// ── checkVelocity ───────────────────────────────────────────────────────────

describe('checkVelocity', () => {
  let history: VelocityEntry[];

  beforeEach(() => { history = []; });

  it('low-risk actions do not count toward velocity', () => {
    checkVelocity(history, 'echo');
    checkVelocity(history, 'noop');
    checkVelocity(history, 'memex-get');
    const result = checkVelocity(history, 'echo');
    expect(result.count).toBe(0);
    expect(result.exceeded).toBe(false);
  });

  it('medium-risk actions accumulate', () => {
    checkVelocity(history, 'fetch');
    checkVelocity(history, 'memex-set');
    const r = checkVelocity(history, 'write');
    expect(r.count).toBe(3);
    expect(r.exceeded).toBe(false); // exactly at limit, not over
  });

  it('exceeds limit on 4th medium-risk action (default limit=3)', () => {
    checkVelocity(history, 'fetch');
    checkVelocity(history, 'memex-set');
    checkVelocity(history, 'write');
    const r = checkVelocity(history, 'configure');
    expect(r.count).toBe(4);
    expect(r.exceeded).toBe(true);
  });

  it('simulates chained medium-risk attack pattern and exceeds velocity', () => {
    // Attacker chains 5 medium-risk actions to bypass per-action gate
    const attackChain = ['fetch', 'memex-set', 'fetch', 'memex-set', 'configure'];
    let result = { exceeded: false, count: 0, limit: 3 };
    for (const t of attackChain) {
      result = checkVelocity(history, t);
    }
    expect(result.exceeded).toBe(true);
  });

  it('prunes old entries outside the window', () => {
    const past = Date.now() - 400_000; // 400s ago — outside default 300s window
    history.push({ type: 'fetch', risk: 'medium', ts: past });
    history.push({ type: 'memex-set', risk: 'medium', ts: past });
    // Both old entries should be pruned; new action starts fresh
    const r = checkVelocity(history, 'write', 300_000, 3);
    expect(r.count).toBe(1); // only the new 'write' remains
    expect(r.exceeded).toBe(false);
  });
});

// ── hasRiskOverride ─────────────────────────────────────────────────────────

describe('hasRiskOverride', () => {
  it('returns false when no scopes', () => {
    expect(hasRiskOverride({ sub: 'agent-1' })).toBe(false);
  });

  it('returns true when scopes string includes risk_override', () => {
    expect(hasRiskOverride({ sub: 'admin', scopes: 'read write risk_override' })).toBe(true);
  });

  it('returns true when scopes array includes risk_override', () => {
    expect(hasRiskOverride({ sub: 'admin', scopes: ['read', 'risk_override'] })).toBe(true);
  });

  it('returns false when scopes present but no risk_override', () => {
    expect(hasRiskOverride({ sub: 'agent', scopes: 'read write' })).toBe(false);
  });
});
