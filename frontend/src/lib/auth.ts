import { useState, useEffect, useCallback } from "react";
import { setToken, clearAuth as clearAuthApi, getStoredUser } from "./api";

export function useAuth() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  const setAuth = useCallback((userData: any, token: string) => {
    setUser(userData);
    setToken(token);
    localStorage.setItem("proofmind_user", JSON.stringify(userData));
  }, []);

  const clearAuth = useCallback(() => {
    setUser(null);
    clearAuthApi();
  }, []);

  return { user, setAuth, clearAuth };
}
