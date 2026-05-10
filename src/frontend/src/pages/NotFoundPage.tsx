import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { BarChart3, Home } from "lucide-react";

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-6">
        <BarChart3 size={32} className="text-primary" />
      </div>
      <h1 className="font-display text-5xl font-bold text-foreground mb-2">
        404
      </h1>
      <h2 className="font-display text-xl font-semibold text-foreground mb-3">
        Page Not Found
      </h2>
      <p className="text-muted-foreground max-w-md mb-8">
        The page you are looking for does not exist or has been moved. Please
        return to the dashboard.
      </p>
      <Button asChild data-ocid="not_found.home.button">
        <Link to="/dashboard">
          <Home size={16} className="mr-2" />
          Back to Dashboard
        </Link>
      </Button>
    </div>
  );
}
