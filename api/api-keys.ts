/**
 * API-key client — talks to Better Auth's `apiKey` plugin endpoints directly
 * (they aren't arc resources). Keys authenticate the MCP endpoint; each is
 * bound to an org via `metadata.orgId`.
 */
const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8020";

export interface ApiKey {
  id: string;
  name: string;
  /** Visible prefix, e.g. "txf_woYUHfvs" (the secret is only shown once, at creation). */
  start: string | null;
  enabled: boolean;
  createdAt: string;
  lastRequest: string | null;
  requestCount: number;
  metadata: { orgId?: string } | null;
}

async function authFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}/api/auth${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { message?: string }).message || `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

/** All keys for the signed-in user; caller filters to the active org by `metadata.orgId`. */
export async function listApiKeys(): Promise<ApiKey[]> {
  const data = await authFetch<{ apiKeys: ApiKey[] }>("/api-key/list");
  return data.apiKeys ?? [];
}

/** Create an org-scoped key; the plaintext `key` is returned ONCE here. */
export async function createApiKey(name: string, orgId: string): Promise<{ key: string; id: string }> {
  return authFetch<{ key: string; id: string }>("/api-key/create", {
    method: "POST",
    body: JSON.stringify({ name, metadata: { orgId } }),
  });
}

export async function deleteApiKey(keyId: string): Promise<void> {
  await authFetch("/api-key/delete", { method: "POST", body: JSON.stringify({ keyId }) });
}

/** The MCP endpoint an agent connects to. */
export const MCP_ENDPOINT = `${BASE}/api/mcp`;
