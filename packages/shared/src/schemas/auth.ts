import { z } from "zod";

/** Atlas roles, least to most privileged (docs/SECURITY.md). */
export const RoleSchema = z.enum(["viewer", "analyst", "admin"]);
export type Role = z.infer<typeof RoleSchema>;

export const LoginRequestSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(128),
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const AuthUserSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  role: RoleSchema,
  orgId: z.uuid(),
});
export type AuthUser = z.infer<typeof AuthUserSchema>;

export const LoginResponseSchema = z.object({
  accessToken: z.string().min(1),
  tokenType: z.literal("Bearer"),
  /** Access-token lifetime; 15 minutes per docs/SECURITY.md. */
  expiresInSeconds: z.number().int().positive(),
  user: AuthUserSchema,
});
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
