# ADR-0003: Keep a separate Python analytics service, internal-only

**Status:** Accepted · 2026-07-21

## Context
The financial engine (IRR, NPV, payback, sensitivity, scenario simulation) is the heart of the product.
The prototype implements it in Python (FastAPI + NumPy/SciPy/Pandas) and exposes it directly to the
browser alongside the Node API — two public backends for one app.

## Decision
Keep Python for the numeric engine as `services/analytics`, but make it **internal-only**: reachable
solely from `apps/api` on the private network. It is stateless (inputs → results), owns no client
session, and its contract is its OpenAPI schema, from which the API's client is generated.

## Consequences
- One public API surface to secure, log, and rate-limit (fixes the prototype's biggest structural flaw).
- The scientific-Python ecosystem (SciPy solvers, Hypothesis property testing) stays available where it
  is genuinely superior for numeric work.
- Cost: two runtimes in CI and deploy; accepted because the engine boundary is the cleanest seam in the
  system and golden-file testing benefits from the engine's isolation.

## Alternatives rejected
- **Rewrite the engine in TypeScript:** loses SciPy's battle-tested solvers and forces re-verifying all
  financial math for zero user-visible gain.
- **Keep both services public:** double attack surface, double auth, CORS complexity — the prototype
  already shows the mess.
