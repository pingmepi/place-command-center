import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Admin imports
import { AdminAuthProvider } from "@/components/admin/AdminAuthProvider";
import { AdminLoginPage } from "@/components/admin/AdminLoginPage";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ProtectedAdminRoute } from "@/components/admin/ProtectedAdminRoute";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import CommunitiesPage from "@/pages/admin/CommunitiesPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AdminAuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              
              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin" element={
                <ProtectedAdminRoute>
                  <AdminLayout />
                </ProtectedAdminRoute>
              }>
                <Route index element={<AdminDashboard />} />
                <Route path="communities" element={<CommunitiesPage />} />
                <Route path="events" element={<div>Events Management - Coming Soon</div>} />
                <Route path="users" element={<div>User Management - Coming Soon</div>} />
                <Route path="discussions" element={<div>Discussion Management - Coming Soon</div>} />
                <Route path="registrations" element={<div>Registration Management - Coming Soon</div>} />
                <Route path="moderation" element={<div>Content Moderation - Coming Soon</div>} />
                <Route path="analytics" element={<div>Analytics - Coming Soon</div>} />
                <Route path="settings" element={<div>System Settings - Coming Soon</div>} />
              </Route>
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AdminAuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
