import { AppLayout } from "@/components/layout/AppLayout";
import { NotificationsTab } from "@/components/settings/NotificationsTab";
import { ProfileTab } from "@/components/settings/ProfileTab";
import { SecurityTab } from "@/components/settings/SecurityTab";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/store/authStore";
import { Link, useRouter } from "@tanstack/react-router";
import { Bell, Crown, Info, LogOut, Shield, User } from "lucide-react";

export function SettingsPage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.navigate({ to: "/login" });
  };

  return (
    <AppLayout>
      <div className="max-w-3xl space-y-6" data-ocid="settings.page">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Settings
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Manage your account, security, and preferences
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/10">
              {user?.role === "treasurer" ? "SK Treasurer" : "SK Chairperson"}
            </Badge>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleLogout}
              data-ocid="settings.logout.button"
            >
              <LogOut size={14} className="mr-1.5" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Tabbed Settings */}
        <Tabs defaultValue="profile" data-ocid="settings.tabs">
          <TabsList className="w-full grid grid-cols-4 h-auto">
            <TabsTrigger
              value="profile"
              className="flex items-center gap-1.5 py-2.5 text-xs sm:text-sm"
              data-ocid="settings.profile.tab"
            >
              <User size={13} />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="flex items-center gap-1.5 py-2.5 text-xs sm:text-sm"
              data-ocid="settings.security.tab"
            >
              <Shield size={13} />
              <span>Security</span>
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="flex items-center gap-1.5 py-2.5 text-xs sm:text-sm"
              data-ocid="settings.notifications.tab"
            >
              <Bell size={13} />
              <span className="hidden sm:inline">Notifications</span>
              <span className="sm:hidden">Alerts</span>
            </TabsTrigger>
            <TabsTrigger
              value="about"
              className="flex items-center gap-1.5 py-2.5 text-xs sm:text-sm"
              data-ocid="settings.about.tab"
            >
              <Info size={13} />
              <span>About</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile */}
          <TabsContent value="profile" className="mt-4">
            <Card className="border-border">
              <CardHeader className="pb-4 border-b border-border">
                <CardTitle className="flex items-center gap-2 font-display text-base">
                  <User size={16} className="text-primary" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5">
                <ProfileTab />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security */}
          <TabsContent value="security" className="mt-4">
            <Card className="border-border">
              <CardHeader className="pb-4 border-b border-border">
                <CardTitle className="flex items-center gap-2 font-display text-base">
                  <Shield size={16} className="text-primary" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5">
                <SecurityTab />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="mt-4">
            <Card className="border-border">
              <CardHeader className="pb-4 border-b border-border">
                <CardTitle className="flex items-center gap-2 font-display text-base">
                  <Bell size={16} className="text-primary" />
                  Notification Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5">
                <NotificationsTab />
              </CardContent>
            </Card>
          </TabsContent>

          {/* About */}
          <TabsContent value="about" className="mt-4">
            <Card className="border-border">
              <CardHeader className="pb-4 border-b border-border">
                <CardTitle className="flex items-center gap-2 font-display text-base">
                  <Info size={16} className="text-primary" />
                  About SKeep
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary flex-shrink-0">
                    <span className="text-primary-foreground font-bold text-xl font-display">
                      SK
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      SKeep v1.0.0
                    </p>
                    <p className="text-sm text-muted-foreground">
                      SK Financial Management Solution
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Released May 2026
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  A digital financial management system designed for SK
                  Treasurers and SK Chairpersons to simplify transaction
                  recording, budgeting, reporting, COA compliance, and financial
                  transparency.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <Button
                    asChild
                    className="flex-1 sm:flex-none"
                    data-ocid="settings.about.button"
                  >
                    <Link to="/settings/about">
                      <Info size={14} className="mr-2" />
                      View Full About Page
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="flex-1 sm:flex-none"
                    data-ocid="settings.subscription.button"
                  >
                    <Link to="/subscription">
                      <Crown size={14} className="mr-2" />
                      Subscription
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
