import { useRouter } from "next/router";
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import axios from "axios";
import Cookies from 'js-cookie';

type User = {
  _id?: string;
  id: string;
  name: string;
  email: string;
  role: "admin" | "editor";
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    // Check for authentication on initial load
    const checkAuth = async () => {
      try {
        const token = Cookies.get('auth_token');
        if (token) {
          // Verify token with backend
          const response = await axios.get('/api/auth/verify', {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (response.data.user) {
            setUser(response.data.user);
            setIsAuthenticated(true);
            localStorage.setItem('auth', JSON.stringify({ isAuthenticated: true }));
          }
        }
      } catch (error) {
        Cookies.remove('auth_token');
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('auth');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);

    if (!email || !password) {
      toast.error("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post('/api/auth/login', {
        email,
        password
      });
      const { token, user } = response.data;

      await Cookies.set('auth_token', token, {
        expires: 7,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      setUser(user);
      setIsAuthenticated(true);
      localStorage.setItem('auth', JSON.stringify({ isAuthenticated: true }));

      if (user.role === 'admin') {
        router.push("/admin/dashboard");
      } else if (user.role === 'editor') {
        router.push("/editor/dashboard");
      }

      toast.success(`Successfully logged in as ${user.role}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Login failed");
      } else {
        toast.error("An unexpected error occurred");
      }

      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('auth');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (error) {
      toast.error(`Something went wrong: Please try again`);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      Cookies.remove('auth_token');

      localStorage.removeItem('auth');
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};