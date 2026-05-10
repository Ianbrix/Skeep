import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuthStore } from "@/store/authStore";
import { Link, useRouter } from "@tanstack/react-router";
import { Bell, ChevronDown, LogOut, Settings, User } from "lucide-react";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/transactions": "Transactions",
  "/budget": "Budget Management",
  "/projects": "Project Management",
  "/coa": "COA Compliance Center",
  "/suppliers": "BIR & Supplier Management",
  "/receipts": "Receipt & Documents",
  "/notifications": "Notifications",
  "/audit": "Audit Trail",
  "/settings": "Settings",
  "/settings/about": "About SKeep",
  "/subscription": "Subscription",
};

interface HeaderProps {
  unreadCount?: number;
  onNotificationsClick?: () => void;
}

export function Header({
  unreadCount = 0,
  onNotificationsClick: _onNotificationsClick,
}: HeaderProps) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const currentPath = router.state.location.pathname;
  const pageTitle = PAGE_TITLES[currentPath] ?? "SKeep";

  const handleLogout = async () => {
    logout();
    router.navigate({ to: "/login" });
  };

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ?? "SK";

  return (
    <header className="flex h-14 items-center gap-4 border-b border-border bg-card px-4 shadow-sm">
      <SidebarTrigger className="-ml-1" />

      <div className="flex-1">
        <h1 className="font-display text-lg font-semibold text-foreground">
          {pageTitle}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          asChild
          data-ocid="header.notifications.button"
          aria-label="Open notifications"
        >
          <Link to="/notifications">
            <Bell size={18} />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -right-0.5 -top-0.5 h-4 min-w-4 px-0.5 text-[10px]"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            )}
          </Link>
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 px-2"
              data-ocid="header.user_menu.button"
            >
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden flex-col items-start sm:flex">
                <span className="text-sm font-medium leading-none">
                  {user?.name ?? "User"}
                </span>
                <span className="text-xs text-muted-foreground capitalize">
                  {user?.role === "treasurer"
                    ? "SK Treasurer"
                    : "SK Chairperson"}
                </span>
              </div>
              <ChevronDown size={14} className="text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild data-ocid="header.profile.menu_item">
              <Link to="/settings">
                <User size={14} className="mr-2" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild data-ocid="header.settings.menu_item">
              <Link to="/settings">
                <Settings size={14} className="mr-2" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={handleLogout}
              data-ocid="header.logout.menu_item"
            >
              <LogOut size={14} className="mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
