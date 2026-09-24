import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useGetMe, login, register, logout, User, LoginBody, RegisterBody, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (data: LoginBody) => Promise<void>;
  register: (data: RegisterBody) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const { data: user, isLoading, isError } = useGetMe({
    query: {
      queryKey: getGetMeQueryKey(),
      enabled: !!token,
      retry: false,
    },
    request: {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }
  });

  useEffect(() => {
    if (isError) {
      localStorage.removeItem("token");
      setToken(null);
    }
  }, [isError]);

  const handleLogin = async (data: LoginBody) => {
    const res = await login(data);
    localStorage.setItem("token", res.token);
    setToken(res.token);
    queryClient.setQueryData(getGetMeQueryKey(), res.user);
    setLocation("/dashboard");
  };

  const handleRegister = async (data: RegisterBody) => {
    const res = await register(data);
    localStorage.setItem("token", res.token);
    setToken(res.token);
    queryClient.setQueryData(getGetMeQueryKey(), res.user);
    setLocation("/dashboard");
  };

  const handleLogout = async () => {
    try {
      if (token) {
         await logout({ headers: { Authorization: `Bearer ${token}` } });
      }
    } finally {
      localStorage.removeItem("token");
      setToken(null);
      queryClient.setQueryData(getGetMeQueryKey(), null);
      setLocation("/login");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading: !!token && isLoading,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
