import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { setAuthTokenGetter, useGetMe } from "./api-client";
import { useLocation } from "wouter";
const AuthContext = createContext(void 0);
function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("village_token"));
  const [user, setUser] = useState(null);
  const [, setLocation] = useLocation();
  const didMountRef = useRef(false);
  useEffect(() => {
    setAuthTokenGetter(() => localStorage.getItem("village_token"));
  }, []);
  const { data: meData, isLoading, refetch, isError } = useGetMe({}, {
    query: {
      enabled: !!token,
      retry: false
    }
  });
  useEffect(() => {
    if (meData) {
      setUser(meData);
    }
  }, [meData]);
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    if (isError && token) {
      localStorage.removeItem("village_token");
      setToken(null);
      setUser(null);
      setLocation("/login");
    }
  }, [isError]);
  const login = (newToken) => {
    localStorage.setItem("village_token", newToken);
    setToken(newToken);
    refetch();
  };
  const logout = () => {
    localStorage.removeItem("village_token");
    setToken(null);
    setUser(null);
    setLocation("/login");
  };
  return <AuthContext.Provider value={{ user, isLoading: !!token && isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>;
}
function useAuth() {
  const context = useContext(AuthContext);
  if (context === void 0) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
export {
  AuthProvider,
  useAuth
};
