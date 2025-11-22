
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState } from '../types';
import { storageService } from '../services/storageService';

interface AuthContextType extends AuthState {
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
  });

  useEffect(() => {
    const checkSession = async () => {
        const storedUser = localStorage.getItem('silapor_active_user');
        if (storedUser) {
            // Opsional: Validasi ulang ke DB kalau perlu, untuk demo kita percaya localStorage
            setAuth({
                user: JSON.parse(storedUser),
                isAuthenticated: true,
            });
        }
    };
    checkSession();
  }, []);

  const login = async (email: string, password?: string): Promise<boolean> => {
    try {
        const user = await storageService.getUserByEmail(email);
        
        // Verifikasi password jika user ditemukan dan password diberikan
        if (user) {
          // Jika password ada di DB, cek apakah cocok
          // Jika password kosong di DB, izinkan login (untuk backward compatibility atau user tanpa pass)
          if (user.password && password) {
             if (user.password !== password) return false;
          }

          localStorage.setItem('silapor_active_user', JSON.stringify(user));
          setAuth({ user, isAuthenticated: true });
          return true;
        }
    } catch (error) {
        console.error("Login error:", error);
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('silapor_active_user');
    setAuth({ user: null, isAuthenticated: false });
  };

  return (
    <AuthContext.Provider value={{ ...auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};