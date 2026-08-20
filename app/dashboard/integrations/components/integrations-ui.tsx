"use client";

import { useState } from "react";
import { Check, Copy, KeyRound, Plug, Plus, Trash2, TriangleAlert } from "lucide-react";
import { HeaderSection } from "@classytic/fluid/dashboard";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DialogWrapper } from "@classytic/fluid/client/dialog-wrapper";
import { useOrganizationId } from "@/contexts/OrganizationContext";
import { useApiKeys, useApiKeyActions } from "@/hooks/query/use-api-keys";
import { MCP_ENDPOINT } from "@/api/api-keys";

const fmtDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-CA") : "—";

function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      {copied ? "Copied" : label}
    </Button>
  );
}

/**
 * Integrations — connect an AI agent (Claude Desktop, the claude.ai connector,
 * MCP Inspector) to TaxFoundry over MCP. The agent gets one tool per resource +
 * action and drives the SAME governed handlers the UI uses. Auth is a per-org
 * API key generated here; the secret is shown once at creation.
 */
export function IntegrationsUI() {
  const orgId = useOrganizationId();
  const { items, isLoading } = useApiKeys(orgId);
  const { create, remove } = useApiKeyActions();

  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [newKey, setNewKey] = useState<string | null>(null);

  const onCreate = async () => {
    if (!orgId) {
      toast.error("No active organization");
      return;
    }
    try {
      const r = await create.mutateAsync({ name: name.trim() || "MCP key", orgId });
      setNewKey(r.key);
      setCreateOpen(false);
      setName("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create key");
    }
  };

  return (
    <div className="space-y-6">
      <HeaderSection
        title="Integrations"
        description="Connect an AI agent to TaxFoundry over MCP. It can prepare, review, and file returns through the same governed tools the dashboard uses."
        icon={Plug}
      />

      {/* Connection details */}
      <Card>
        <CardHeader className="flex-row items-center gap-2 space-y-0">
          <Plug className="size-5" />
          <CardTitle className="text-base">MCP connection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="mb-1 text-sm font-medium">Endpoint</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 truncate rounded-md border bg-muted px-3 py-2 text-xs">
                {MCP_ENDPOINT}
              </code>
              <CopyButton value={MCP_ENDPOINT} />
            </div>
          </div>
          <div className="rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
            <p className="mb-1 font-medium text-foreground">How to connect</p>
            <ol className="list-decimal space-y-1 pl-5">
              <li>Generate an API key below (you'll see the secret once. Copy it).</li>
              <li>
                In your MCP client (Claude Desktop / claude.ai connector / Inspector), add a custom
                connector pointing at the endpoint above.
              </li>
              <li>
                Set the authorization header to <code className="text-foreground">Bearer &lt;your key&gt;</code>.
                The agent is then scoped to this organization.
              </li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* API keys */}
      <Card>
        <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
          <div className="flex items-center gap-2">
            <KeyRound className="size-5" />
            <CardTitle className="text-base">API keys</CardTitle>
          </div>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" /> New key
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {newKey && (
            <div className="space-y-2 rounded-md border border-amber-500/40 bg-amber-500/5 p-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <TriangleAlert className="size-4 text-amber-600" />
                Copy your key now. It won't be shown again.
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 truncate rounded-md border bg-background px-3 py-2 font-mono text-xs">
                  {newKey}
                </code>
                <CopyButton value={newKey} label="Copy key" />
              </div>
              <Button variant="ghost" size="sm" onClick={() => setNewKey(null)}>
                Done
              </Button>
            </div>
          )}

          {isLoading && <p className="text-sm text-muted-foreground">Loading keys…</p>}
          {!isLoading && items.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No API keys yet. Create one to connect an agent.
            </p>
          )}

          {items.map((k) => (
            <div key={k.id} className="flex items-center justify-between gap-3 rounded-md border p-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{k.name}</span>
                  <code className="font-mono text-xs text-muted-foreground">{k.start}…</code>
                  {!k.enabled && <Badge variant="secondary">disabled</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">
                  Created {fmtDate(k.createdAt)} · {k.requestCount} call{k.requestCount === 1 ? "" : "s"}
                  {k.lastRequest ? ` · last used ${fmtDate(k.lastRequest)}` : ""}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={remove.isPending}
                onClick={async () => {
                  await remove.mutateAsync(k.id);
                  toast.success("Key revoked");
                }}
              >
                <Trash2 className="size-4" /> Revoke
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <DialogWrapper
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="New API key"
        description={'Name it so you can recognise it later (e.g. "Claude Desktop"). The key is scoped to this organization.'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button disabled={create.isPending} onClick={onCreate}>
              {create.isPending ? "Creating…" : "Create key"}
            </Button>
          </>
        }
      >
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Key name"
          onKeyDown={(e) => e.key === "Enter" && onCreate()}
        />
      </DialogWrapper>
    </div>
  );
}
