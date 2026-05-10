import { Role } from "@/backend";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/store/authStore";
import { Link, useRouter } from "@tanstack/react-router";
import {
  BarChart3,
  Bell,
  BookOpen,
  Briefcase,
  CreditCard,
  FileText,
  FolderOpen,
  Home,
  Info,
  LayoutDashboard,
  Receipt,
  Settings,
  Shield,
  ShoppingCart,
  Wallet,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

const mainNav: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard size={18} />,
  },
];

const financialsNav: NavItem[] = [
  { label: "Transactions", href: "/transactions", icon: <Receipt size={18} /> },
  { label: "Budget", href: "/budget", icon: <Wallet size={18} /> },
];

const managementNav: NavItem[] = [
  { label: "Projects", href: "/projects", icon: <Briefcase size={18} /> },
  { label: "Receipts", href: "/receipts", icon: <FileText size={18} /> },
];

const complianceNav: NavItem[] = [
  { label: "COA Center", href: "/coa", icon: <BookOpen size={18} /> },
  {
    label: "BIR & Suppliers",
    href: "/suppliers",
    icon: <ShoppingCart size={18} />,
  },
];

const systemNav: NavItem[] = [
  { label: "Notifications", href: "/notifications", icon: <Bell size={18} /> },
  { label: "Audit Trail", href: "/audit", icon: <Shield size={18} /> },
  { label: "Settings", href: "/settings", icon: <Settings size={18} /> },
];

function NavSection({
  label,
  items,
  currentPath,
}: { label: string; items: NavItem[]; currentPath: string }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isActive =
            currentPath === item.href ||
            currentPath.startsWith(`${item.href}/`);
          return (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={isActive}
                data-ocid={`sidebar.${item.label.toLowerCase().replace(/[^a-z0-9]/g, "_")}.link`}
              >
                <Link to={item.href} className="flex items-center gap-2">
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <Badge
                      variant="destructive"
                      className="ml-auto h-5 min-w-5 px-1 text-xs"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

export function AppSidebar({ unreadCount = 0 }: { unreadCount?: number }) {
  const { user } = useAuthStore();
  const router = useRouter();
  const currentPath = router.state.location.pathname;

  const systemNavWithBadge = systemNav.map((item) =>
    item.href === "/notifications" ? { ...item, badge: unreadCount } : item,
  );

  return (
    <Sidebar collapsible="icon">
      {/* Logo / Header */}
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            <BarChart3 size={16} className="text-primary-foreground" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-display text-base font-bold text-foreground">
              SKeep
            </span>
            <span className="text-[10px] text-muted-foreground">
              SK Financial System
            </span>
          </div>
        </div>
      </SidebarHeader>

      {/* Role badge */}
      <div className="px-3 py-2 group-data-[collapsible=icon]:hidden">
        <div
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
            user?.role === Role.treasurer
              ? "bg-primary/10 text-primary border border-primary/20"
              : "bg-accent/30 text-accent-foreground border border-accent/30"
          }`}
        >
          <Home size={10} />
          {user?.role === Role.treasurer ? "SK Treasurer" : "SK Chairperson"}
        </div>
      </div>

      <SidebarContent>
        <NavSection label="Main" items={mainNav} currentPath={currentPath} />
        <SidebarSeparator />
        <NavSection
          label="Financials"
          items={financialsNav}
          currentPath={currentPath}
        />
        <SidebarSeparator />
        <NavSection
          label="Management"
          items={managementNav}
          currentPath={currentPath}
        />
        <SidebarSeparator />
        <NavSection
          label="Compliance"
          items={complianceNav}
          currentPath={currentPath}
        />
        <SidebarSeparator />
        <NavSection
          label="System"
          items={systemNavWithBadge}
          currentPath={currentPath}
        />
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild data-ocid="sidebar.about.link">
              <Link to="/settings/about" className="flex items-center gap-2">
                <Info size={18} />
                <span>About SKeep</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild data-ocid="sidebar.subscription.link">
              <Link to="/subscription" className="flex items-center gap-2">
                <CreditCard size={18} />
                <span>Subscription</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
