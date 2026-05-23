import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

type AuthContextType = {
  role: string | null;
  fullName: string | null;
  login: (token: string, role: string, fullName: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {

  const [role, setRole] = useState<string | null>(
    localStorage.getItem("role")
  );

  const [fullName, setFullName] = useState<string | null>(
    localStorage.getItem("fullName")
  );

  const login = (token: string, role: string, fullName: string) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    localStorage.setItem("fullName", fullName);

    setRole(role);
    setFullName(fullName);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("fullName");

    setRole(null);
    setFullName(null);
  };

  return (
    <AuthContext.Provider value={{ role, fullName, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext)!;
};