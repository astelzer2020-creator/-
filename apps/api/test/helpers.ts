import { randomUUID } from "node:crypto";

import type { FastifyInstance } from "fastify";
import type { Role } from "@atlas/shared";

import { buildApp, type BuildAppOptions } from "../src/app.js";
import type { AppConfig } from "../src/config/env.js";
import type { SeedUser } from "../src/modules/auth/user-store.js";

export const ANALYTICS_ORIGIN = "http://analytics.internal.test";

export const TEST_CONFIG: AppConfig = {
  nodeEnv: "test",
  host: "127.0.0.1",
  port: 0,
  analyticsUrl: ANALYTICS_ORIGIN,
  jwtSecret: "test-secret-test-secret-test-secret-42",
  databaseUrl: undefined,
  seedUserPassword: undefined,
};

export const ORG_A = randomUUID();
export const ORG_B = randomUUID();

export const PASSWORD = "correct-horse-battery";

export const USERS = {
  adminA: {
    email: "admin-a@example.com",
    password: PASSWORD,
    role: "admin" as Role,
    orgId: ORG_A,
  },
  analystA: {
    email: "analyst-a@example.com",
    password: PASSWORD,
    role: "analyst" as Role,
    orgId: ORG_A,
  },
  viewerA: {
    email: "viewer-a@example.com",
    password: PASSWORD,
    role: "viewer" as Role,
    orgId: ORG_A,
  },
  analystB: {
    email: "analyst-b@example.com",
    password: PASSWORD,
    role: "analyst" as Role,
    orgId: ORG_B,
  },
} satisfies Record<string, SeedUser>;

export async function makeApp(
  overrides: Partial<BuildAppOptions> = {},
): Promise<FastifyInstance> {
  return buildApp({
    config: TEST_CONFIG,
    seedUsers: Object.values(USERS),
    ...overrides,
  });
}

export async function login(
  app: FastifyInstance,
  user: SeedUser,
): Promise<string> {
  const response = await app.inject({
    method: "POST",
    url: "/auth/login",
    payload: { email: user.email, password: user.password },
  });
  if (response.statusCode !== 200) {
    throw new Error(`login failed for ${user.email}: ${response.body}`);
  }
  return (response.json() as { accessToken: string }).accessToken;
}

export function bearer(token: string): { authorization: string } {
  return { authorization: `Bearer ${token}` };
}

export const PROJECT_BODY = {
  name: "רוטשילד 45",
  caseNumber: "2024-001",
  city: "תל אביב",
};

export const SCENARIO_BODY = {
  name: "תרחיש בסיס",
  apartmentMix: [
    {
      label: "3 חדרים",
      units: 40,
      areaSqm: 85,
      salePricePerSqmAgorot: 4_500_000,
    },
  ],
  costItems: [{ label: "עלות בנייה", amountAgorot: 9_000_000_000 }],
  discountRate: 0.07,
};

export const SIMULATION_FIXTURE = {
  irr: "0.1432",
  npvAgorot: 123_456_700,
  profitAgorot: 250_000_000,
  roiOnCost: 0.185,
  paybackYears: 4.2,
  sensitivity: {
    priceDeltas: [-0.1, 0, 0.1],
    costDeltas: [-0.1, 0, 0.1],
    npvAgorot: [
      [100_000_000, 120_000_000, 140_000_000],
      [110_000_000, 123_456_700, 150_000_000],
      [115_000_000, 130_000_000, 160_000_000],
    ],
  },
};
