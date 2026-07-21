# ADR-0002: TypeScript everywhere on the JS side; Fastify for the API

**Status:** Accepted · 2026-07-21

## Context
The prototype is plain JavaScript (React JSX, Express) with no validation layer; imported taba data flows
untyped from file parser to UI. The product's value is numeric trust — type errors here are financially
wrong answers, not cosmetic bugs.

## Decision
All JS surfaces (web, mobile, api, packages) are TypeScript in strict mode. The API is rebuilt on
**Fastify** with Zod schemas at every boundary; types are inferred from schemas in `packages/shared`
so clients and server share one contract.

## Consequences
- Porting prototype code requires typing it — treated as a feature (it forces auditing the data flow).
- Fastify gives schema-validation, structured logging (pino), and OpenAPI generation out of the box,
  all of which Express needed middleware and discipline for.

## Alternatives rejected
- **Stay with Express:** viable but everything Atlas needs (validation, OpenAPI, logging) is bolted on;
  Fastify has it native, with better performance as a free extra.
- **NestJS:** too much framework ceremony (DI, decorators) for a small team; slows onboarding without
  paying for itself at this scale.
- **Keep plain JS with JSDoc:** does not enforce anything at CI time.
