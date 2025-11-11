import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { FormList } from "./components/admin/FormList";
import { FormEditor } from "./components/admin/FormEditor";
import { FormSubmissions } from "./components/admin/FormSubmissions";
import { FormRenderer } from "./components/public/FormRenderer";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Navigate to="/admin" replace />} />
      <Route path="/admin" element={<ProtectedRoute><FormList /></ProtectedRoute>} />
      <Route path="/admin/forms/:id" element={<ProtectedRoute><FormEditor /></ProtectedRoute>} />
      <Route path="/admin/forms/:id/submissions" element={<ProtectedRoute><FormSubmissions /></ProtectedRoute>} />
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
