import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { PortalAuthProvider } from "./contexts/PortalAuthContext";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import AdminClients from "./pages/admin/AdminClients";
import PortalLogin from "./pages/portal/PortalLogin";
import PortalDashboard from "./pages/portal/PortalDashboard";
import PortalProjects from "./pages/portal/PortalProjects";
import PortalProjectDetail from "./pages/portal/PortalProjectDetail";
import PortalFiles from "./pages/portal/PortalFiles";
import PortalInvoices from "./pages/portal/PortalInvoices";
import PortalInvoiceDetail from "./pages/portal/PortalInvoiceDetail";
import PortalMessages from "./pages/portal/PortalMessages";
import PortalDeliveries from "./pages/portal/PortalDeliveries";
import PortalDeliveryDetail from "./pages/portal/PortalDeliveryDetail";
import PortalNotifications from "./pages/portal/PortalNotifications";
import { GoogleAnalytics, GoogleTagManager } from "./components/Analytics";
import { PerformanceMonitor } from "./components/PerformanceMonitor";
import { useVisitorTracking } from "./hooks/useVisitorTracking";
import { useMetaPixel } from "./hooks/useMetaPixel";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/admin"} component={Admin} />
      <Route path={"/admin/clients"} component={AdminClients} />

      {/* Portal Routes */}
      <Route path={"/portal"}>
        {() => {
          window.location.href = "/portal/dashboard";
          return null;
        }}
      </Route>
      <Route path={"/portal/login"} component={PortalLogin} />
      <Route path={"/portal/dashboard"} component={PortalDashboard} />
      <Route path={"/portal/projects"} component={PortalProjects} />
      <Route path={"/portal/projects/:id"} component={PortalProjectDetail} />
      <Route path={"/portal/files"} component={PortalFiles} />
      <Route path={"/portal/invoices"} component={PortalInvoices} />
      <Route path={"/portal/invoices/:id"} component={PortalInvoiceDetail} />
      <Route path={"/portal/messages"} component={PortalMessages} />
      <Route path={"/portal/deliveries"} component={PortalDeliveries} />
      <Route path={"/portal/deliveries/:id"} component={PortalDeliveryDetail} />
      <Route path={"/portal/notifications"} component={PortalNotifications} />

      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  // Tracking automático de visitantes
  useVisitorTracking();

  // Meta Pixel (Facebook Pixel)
  useMetaPixel();

  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        // switchable
      >
        <PortalAuthProvider>
          <TooltipProvider>
            <GoogleAnalytics />
            <GoogleTagManager />
            <PerformanceMonitor />
            <Toaster />
            <Router />
          </TooltipProvider>
        </PortalAuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
