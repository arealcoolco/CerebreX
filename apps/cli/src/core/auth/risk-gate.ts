/**
 * CerebreX AUTH — Risk Classification Gate
 *
 * Every agent action is classified as LOW / MEDIUM / HIGH risk
 * before execution. Evaluation order: Deny → Ask → Allow.
 *
 * Denial reasons are surfaced to the caller so the agent can
 * adjust its plan rather than silently failing.
 */

export type RiskLevel = 'low' | 'medium' | 'high';

export interface RiskPolicy {
  allowLow: boolean;
  allowMedium: boolean;
  allowHigh: boolean;
}

export interface GateResult {
  allowed: boolean;
  risk: RiskLevel;
  reason?: string;
}

export const DEFAULT_POLICY: RiskPolicy = {
  allowLow: true,
  allowMedium: true,
  allowHigh: false,
};

// ── Risk classification table ─────────────────────────────────────────────────

const TOOL_RISK: Record<string, RiskLevel> = {
  // Read-only — always safe
  noop:            'low',
  echo:            'low',
  'memex-get':     'low',
  status:          'low',
  list:            'low',
  search:          'low',
  read:            'low',
  'trace-view':    'low',

  // Side-effects — confirm before running in automated contexts
  fetch:           'medium',
  'memex-set':     'medium',
  write:           'medium',
  update:          'medium',
  configure:       'medium',
  'trace-start':   'medium',
  'trace-stop':    'medium',
  'kairos-action': 'medium',   // daemon-generated structured task; side-effects depend on sub-type
  'claude-execute':'medium',   // Claude subtask; reads/writes MEMEX but no irreversible ops

  // Irreversible / high-blast-radius — explicit opt-in required
  delete:          'high',
  destroy:         'high',
  'memex-delete':  'high',
  deploy:          'high',
  publish:         'high',
  send:            'high',
  'hive-send':     'high',
  'ultraplan':     'high',
  'daemon-start':  'high',
  'daemon-stop':   'high',
};

/** Classify the risk level of a tool/task type. Defaults to 'high' for unknowns. */
export function classifyRisk(toolName: string): RiskLevel {
  const normalized = toolName.toLowerCase().trim();
  return TOOL_RISK[normalized] ?? 'high';
}

/**
 * Gate an action against a risk policy.
 *
 * @param toolName  The tool or task type being executed
 * @param policy    The caller's allowed risk policy (defaults to DEFAULT_POLICY)
 * @returns         GateResult — check .allowed before proceeding
 *
 * @example
 * const gate = gateAction('delete', { ...DEFAULT_POLICY });
 * if (!gate.allowed) {
 *   console.error(`Blocked: ${gate.reason}`);
 *   process.exit(1);
 * }
 */
export function gateAction(
  toolName: string,
  policy: RiskPolicy = DEFAULT_POLICY
): GateResult {
  const risk = classifyRisk(toolName);

  // Evaluation order: Deny → Ask → Allow
  if (risk === 'high' && !policy.allowHigh) {
    return {
      allowed: false,
      risk,
      reason: `"${toolName}" is classified HIGH risk. Pass --allow-high-risk to enable.`,
    };
  }
  if (risk === 'medium' && !policy.allowMedium) {
    return {
      allowed: false,
      risk,
      reason: `"${toolName}" is classified MEDIUM risk. Pass --allow-medium-risk to enable.`,
    };
  }
  if (risk === 'low' && !policy.allowLow) {
    return {
      allowed: false,
      risk,
      reason: `"${toolName}" is classified LOW risk but all actions are blocked by policy.`,
    };
  }

  return { allowed: true, risk };
}

/** Build a policy object from CLI flags. */
export function buildPolicy(flags: {
  allowHighRisk?: boolean;
  allowMediumRisk?: boolean;
}): RiskPolicy {
  return {
    allowLow: true,
    allowMedium: flags.allowMediumRisk ?? true,
    allowHigh: flags.allowHighRisk ?? false,
  };
}

// ── Aggregate risk scoring ────────────────────────────────────────────────────

const RISK_WEIGHT: Record<RiskLevel, number> = { low: 1, medium: 3, high: 10 };

/**
 * Compute cumulative risk for an AlterPlan task array before execution begins.
 * If score >= threshold (default 12, env CEREBREX_AGGREGATE_RISK_THRESHOLD),
 * the full plan requires RECORD SWARM quorum rather than per-action gating.
 */
export function aggregateRiskScore(taskTypes: string[]): {
  score: number;
  breakdown: Array<{ type: string; risk: RiskLevel; weight: number }>;
  requiresQuorum: boolean;
} {
  const threshold = parseInt(process.env['CEREBREX_AGGREGATE_RISK_THRESHOLD'] ?? '12', 10);
  const breakdown = taskTypes.map((t) => {
    const risk = classifyRisk(t);
    return { type: t, risk, weight: RISK_WEIGHT[risk] };
  });
  const score = breakdown.reduce((s, b) => s + b.weight, 0);
  return { score, breakdown, requiresQuorum: score >= threshold };
}

// ── Velocity tracking ─────────────────────────────────────────────────────────

export const DEFAULT_VELOCITY_LIMIT = parseInt(
  process.env['CEREBREX_VELOCITY_LIMIT'] ?? '3', 10
);
export const DEFAULT_VELOCITY_WINDOW_MS = parseInt(
  process.env['CEREBREX_VELOCITY_WINDOW_MS'] ?? '300000', 10
);

export interface VelocityEntry { type: string; risk: RiskLevel; ts: number }

/**
 * Check whether an agent has hit the velocity limit within the rolling window.
 * Mutates `history` in-place (prunes stale entries, appends new action).
 * Returns { exceeded, count, limit } — callers escalate to quorum when exceeded.
 */
export function checkVelocity(
  history: VelocityEntry[],
  newType: string,
  windowMs = DEFAULT_VELOCITY_WINDOW_MS,
  limit = DEFAULT_VELOCITY_LIMIT,
): { exceeded: boolean; count: number; limit: number } {
  const now = Date.now();
  const cutoff = now - windowMs;
  const pruned = history.filter((e) => e.ts >= cutoff && e.risk !== 'low');
  history.length = 0;
  history.push(...pruned);
  const risk = classifyRisk(newType);
  if (risk !== 'low') history.push({ type: newType, risk, ts: now });
  const count = history.length;
  return { exceeded: count > limit, count, limit };
}

/**
 * Agents with "risk_override" scope (decoded from JWT `scopes` claim) can bypass
 * velocity limits. Only admin-level agents should hold this scope.
 */
export function hasRiskOverride(jwtPayload: Record<string, unknown>): boolean {
  const s = jwtPayload['scopes'];
  if (typeof s === 'string') return s.split(' ').includes('risk_override');
  if (Array.isArray(s)) return (s as string[]).includes('risk_override');
  return false;
}
