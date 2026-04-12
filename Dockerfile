# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM oven/bun:1-debian AS builder

WORKDIR /workspace

# Copy workspace manifest + lockfile + root tsconfig first (layer cache)
COPY package.json bun.lockb* tsconfig.json ./
COPY packages/types/       packages/types/
COPY packages/core/        packages/core/
COPY packages/registry-client/ packages/registry-client/
COPY apps/cli/             apps/cli/

# Install all dependencies (workspace-aware)
RUN bun install --frozen-lockfile

# Build workspace packages in dependency order
RUN cd packages/types          && bun run build
RUN cd packages/core           && bun run build
RUN cd packages/registry-client && bun run build

# Compile a self-contained Linux x64 binary (glibc; matches debian:12-slim runtime)
RUN cd apps/cli && bun run build:linux-x64

# ── Stage 2: Runtime ──────────────────────────────────────────────────────────
# Use debian:slim — Bun compiled binaries link libstdc++/libgcc which glibc provides.
# Alpine (musl) lacks these symbols even with the musl cross-compile target.
FROM debian:12-slim

# ca-certificates: needed for HTTPS calls to Cloudflare workers / npm registry
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates && rm -rf /var/lib/apt/lists/*

COPY --from=builder /workspace/apps/cli/dist/cerebrex-linux-x64 /usr/local/bin/cerebrex
RUN chmod +x /usr/local/bin/cerebrex

# Sanity check during build
RUN cerebrex --version

ENTRYPOINT ["cerebrex"]
CMD ["--help"]
