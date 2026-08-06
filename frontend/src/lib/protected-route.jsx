import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();
  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    }
  }, [user, isLoading, navigate]);
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-muted-foreground">Loading...</div>
      </div>;
  }
  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-muted-foreground">Redirecting to login...</div>
      </div>;
  }
  return children;
}
export {
  ProtectedRoute as default
};
