import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useUnreadCount } from "@/hooks/useBackend";
import { useAuthStore } from "@/store/authStore";
import { Header } from "./Header";
import { AppSidebar } from "./Sidebar";

interface AppLayoutProps {
  children: React.ReactNode;
  unreadCount?: number;
}

export function AppLayout({ children, unreadCount }: AppLayoutProps) {
  const { user } = useAuthStore();
  const { data: liveUnreadCount } = useUnreadCount(user?.id);
  const resolvedCount =
    unreadCount ??
    (liveUnreadCount !== undefined ? Number(liveUnreadCount) : 0);

  return (
    <SidebarProvider>
      <AppSidebar unreadCount={resolvedCount} />
      <SidebarInset>
        <Header unreadCount={resolvedCount} />
        <main className="flex-1 overflow-auto bg-background p-6">
          {children}
        </main>
        <footer className="border-t border-border bg-muted/40 px-6 py-3 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
