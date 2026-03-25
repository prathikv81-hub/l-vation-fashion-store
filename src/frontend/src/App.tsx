import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import AdminPage from "./pages/AdminPage";
import StorefrontPage from "./pages/StorefrontPage";

const queryClient = new QueryClient();

export default function App() {
  const [page, setPage] = useState<"storefront" | "admin">(
    window.location.pathname === "/admin" ? "admin" : "storefront",
  );

  const navigate = (to: "storefront" | "admin") => {
    window.history.pushState({}, "", to === "admin" ? "/admin" : "/");
    setPage(to);
  };

  return (
    <QueryClientProvider client={queryClient}>
      {page === "storefront" ? (
        <StorefrontPage onNavigateAdmin={() => navigate("admin")} />
      ) : (
        <AdminPage onNavigateBack={() => navigate("storefront")} />
      )}
      <Toaster />
    </QueryClientProvider>
  );
}
