"use client";

import { createContext, useContext, ReactNode } from "react";
import { UseQueryResult } from "@tanstack/react-query";
import { User, useAuth } from "../../features/auth";

type AuthContextType = UseQueryResult<User | null, unknown>;

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const authQuery = useAuth() // React Query handles user

  return (
    <AuthContext.Provider value={authQuery}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error();
  }
  return ctx;
}
