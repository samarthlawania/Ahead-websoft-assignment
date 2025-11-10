import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AuthForm } from "./components/auth/AuthForm";
import { FormList } from "./components/admin/FormList";
import { FormEditor } from "./components/admin/FormEditor";
import { FormSubmissions } from "./components/admin/FormSubmissions";
import { FormRenderer } from "./components/public/FormRenderer";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { isAuthenticated, login } = useAuth();

  if (!isAuthenticated) {
    return <AuthForm onSuccess={login} />;
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin" replace />} />
      <Route path="/admin" element={<FormList />} />
      <Route path="/admin/forms/:id" element={<FormEditor />} />
      <Route path="/admin/forms/:id/submissions" element={<FormSubmissions />} />
      <Route path="/forms/:id" element={<FormRenderer />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
