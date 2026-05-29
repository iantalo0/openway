import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

async function getNodeHealth() {
  const apiUrl = process.env.API_URL || "http://localhost:8080";
  try {
    const res = await fetch(`${apiUrl}/api/v1/nodes/health`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function NodesPage() {
  const nodes = await getNodeHealth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-etherscan-lg font-semibold text-etherscan-text-primary">
          RPC Node Infrastructure
        </h1>
        <p className="text-etherscan-sm text-etherscan-text-secondary mt-1">
          Live connectivity and latency monitoring.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {nodes.map((node: any) => (
          <Card key={node.url}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-etherscan-xs truncate max-w-[180px]">
                  {node.url}
                </CardTitle>
                <span
                  className={`w-2.5 h-2.5 rounded-full ${node.healthy ? "bg-etherscan-success" : "bg-etherscan-danger"}`}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-etherscan-sm">
                <span className="text-etherscan-text-secondary">Latency</span>
                <span className="font-mono">{node.latency_ms}ms</span>
              </div>
              <div className="flex justify-between text-etherscan-sm">
                <span className="text-etherscan-text-secondary">
                  Block Height
                </span>
                <span className="font-mono">
                  {node.block?.toLocaleString() || "N/A"}
                </span>
              </div>
              <div className="flex justify-between text-etherscan-sm">
                <span className="text-etherscan-text-secondary">Status</span>
                <span
                  className={
                    node.healthy
                      ? "text-etherscan-success"
                      : "text-etherscan-danger"
                  }
                >
                  {node.healthy ? "Operational" : "Degraded"}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
