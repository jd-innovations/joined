import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_tabs/marketplace")({
  head: () => ({
    meta: [
      { title: "Marketplace — Sideline" },
      { name: "description", content: "Buy, sell, and trade sports gear." },
      { property: "og:title", content: "Marketplace — Sideline" },
      { property: "og:description", content: "Buy, sell, and trade sports gear." },
    ],
  }),
  component: MarketplacePage,
});

function MarketplacePage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">Marketplace</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sports gear listings coming next.
        </p>
      </div>
    </div>
  );
}
