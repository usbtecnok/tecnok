import { useEffect, useState } from "react";
import { useLocation } from "wouter";

export function useAdminAuth() {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/admin/check", {
          credentials: "include",
        });
        
        if (response.ok) {
          const data = await response.json();
          setIsAuthenticated(data.authenticated);
          
          if (!data.authenticated) {
            setLocation("/admin/login");
          }
        } else {
          setIsAuthenticated(false);
          setLocation("/admin/login");
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setIsAuthenticated(false);
        setLocation("/admin/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [setLocation]);

  return { isAuthenticated, isLoading };
}
