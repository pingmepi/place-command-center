import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

// Admin imports
import { AdminAuthProvider } from "@/components/admin/AdminAuthProvider";
import { AdminLoginPage } from "@/components/admin/AdminLoginPage";
import { AdminOAuthCallback } from "@/components/admin/AdminOAuthCallback";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ProtectedAdminRoute } from "@/components/admin/ProtectedAdminRoute";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import CommunitiesPage from "@/pages/admin/CommunitiesPage";
import CommunityDetailsPage from "@/pages/admin/CommunityDetailsPage";
import EventsPage from "@/pages/admin/EventsPage";
import UsersPage from "@/pages/admin/UsersPage";
import DiscussionsPage from "@/pages/admin/DiscussionsPage";
import DiscussionDetailsPage from "@/pages/admin/DiscussionDetailsPage";
import RegistrationsPage from "@/pages/admin/RegistrationsPage";
import ModerationPage from "@/pages/admin/ModerationPage";
import AnalyticsPage from "@/pages/admin/AnalyticsPage";
import AdvancedUserManagementPage from "@/pages/admin/AdvancedUserManagementPage";
import SystemSettingsPage from "@/pages/admin/SystemSettingsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AdminAuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ErrorBoundary>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Navigate to="/admin" replace />} />

                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route path="/admin/callback" element={<AdminOAuthCallback />} />
                <Route path="/admin" element={
                  <ProtectedAdminRoute>
                    <AdminLayout />
                  </ProtectedAdminRoute>
                }>
                  {/* Redirect bare /admin to /admin/dashboard */}
                  <Route index element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="communities" element={<CommunitiesPage />} />
                  <Route path="communities/:id" element={<CommunityDetailsPage />} />
                  <Route path="events" element={<EventsPage />} />
                  <Route path="users" element={<UsersPage />} />
                  <Route path="discussions" element={<DiscussionsPage />} />
                  <Route path="discussions/:id" element={<DiscussionDetailsPage />} />
                  <Route path="registrations" element={<RegistrationsPage />} />
                  <Route path="moderation" element={<ModerationPage />} />
                  <Route path="analytics" element={<AnalyticsPage />} />
                  <Route path="advanced-users" element={<AdvancedUserManagementPage />} />
                  <Route path="settings" element={<SystemSettingsPage />} />
                </Route>

                {/* Catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ErrorBoundary>
          </BrowserRouter>
        </TooltipProvider>
      </AdminAuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
