import React, { createContext, useState, ReactNode } from "react";

type Role = "client" | "employee";

interface AuthContextProps {
  isAuthenticated: boolean;
  role: Role | null;
  login: (r: Role) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

export const AuthProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [role, setRole] = useState<Role | null>(null);

  const login = (r: Role) => setRole(r);
  const logout = () => setRole(null);

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!role, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
