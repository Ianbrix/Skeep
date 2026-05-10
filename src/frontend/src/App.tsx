import { Toaster } from "@/components/ui/sonner";
import { useAuthStore } from "@/store/authStore";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Navigate,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AboutPage } from "./pages/AboutPage";
import { AuditPage } from "./pages/AuditPage";
import { BudgetPage } from "./pages/BudgetPage";
import { CoaPage } from "./pages/CoaPage";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { PlaceholderPage } from "./pages/PlaceholderPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { ReceiptsPage } from "./pages/ReceiptsPage";
import { RegisterPage } from "./pages/RegisterPage";
import { SettingsPage } from "./pages/SettingsPage";
import { SubscriptionPage } from "./pages/SubscriptionPage";
import { SuppliersPage } from "./pages/SuppliersPage";
import { TransactionsPage } from "./pages/TransactionsPage";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

// Root route
const rootRoute = createRootRoute({
  notFoundComponent: NotFoundPage,
});

// Auth routes (public)
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: RegisterPage,
});

const aboutPublicRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/about",
  component: AboutPage,
});

// Protected layout route
const protectedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "protected",
  component: ProtectedRoute,
});

// Index redirect
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: function IndexRedirect() {
    const { isAuthenticated } = useAuthStore();
    return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} />;
  },
});

// Protected pages
const dashboardRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/dashboard",
  component: DashboardPage,
});

const transactionsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/transactions",
  component: TransactionsPage,
});

const budgetRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/budget",
  component: BudgetPage,
});

const projectsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/projects",
  component: ProjectsPage,
});

const coaRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/coa",
  component: CoaPage,
});

const suppliersRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/suppliers",
  component: SuppliersPage,
});

const receiptsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/receipts",
  component: ReceiptsPage,
});

const notificationsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/notifications",
  component: NotificationsPage,
});

const auditRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/audit",
  component: AuditPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/settings",
  component: SettingsPage,
});

const settingsAboutRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/settings/about",
  component: AboutPage,
});

const subscriptionRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/subscription",
  component: SubscriptionPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  registerRoute,
  aboutPublicRoute,
  protectedRoute.addChildren([
    dashboardRoute,
    transactionsRoute,
    budgetRoute,
    projectsRoute,
    coaRoute,
    suppliersRoute,
    receiptsRoute,
    notificationsRoute,
    auditRoute,
    settingsRoute,
    settingsAboutRoute,
    subscriptionRoute,
  ]),
]);

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function AppWithSession() {
  const { restoreSession } = useAuthStore();

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  return <RouterProvider router={router} />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppWithSession />
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );
}
