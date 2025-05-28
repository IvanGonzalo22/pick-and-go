// src/features/auth/hooks/useAuth.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { API } from '../../../common/utils/api';

interface User {
  id: string;
  email: string;
  role: 'Client' | 'Employee' | 'SuperAdmin';
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // 1) Al iniciar la app, comprobamos si hay sesión activa
  useEffect(() => {
    API.get<User>('/auth/me')
      .then(res => setUser(res.data))
      .catch(() => setUser(null));
  }, []);

  // 2) Login: llama a /auth/login y guarda el user
  const login = async (email: string, password: string) => {
    const res = await API.post<User>('/auth/login', { email, password });
    setUser(res.data);
  };

  // 3) Logout: llama a /auth/logout y limpia el user
  const logout = async () => {
    await API.post('/auth/logout');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}