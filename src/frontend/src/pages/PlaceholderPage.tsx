import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Construction } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <AppLayout>
      <div
        className="flex flex-col items-center justify-center min-h-[60vh] text-center"
        data-ocid="placeholder.page"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
          <Construction size={32} className="text-muted-foreground" />
        </div>
        <h2 className="font-display text-2xl font-bold text-foreground mb-2">
          {title}
        </h2>
        <p className="text-muted-foreground max-w-md mb-6">
          {description ??
            "This module is currently under development. Check back soon for the full feature set."}
        </p>
        <Button variant="outline" onClick={() => window.history.back()}>
          Go Back
        </Button>
      </div>
    </AppLayout>
  );
}
