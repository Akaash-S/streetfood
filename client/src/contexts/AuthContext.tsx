import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, onAuthChange, logout as firebaseLogout } from "@/lib/firebase";
import { User } from "firebase/auth";
import { User as DBUser } from "@shared/schema";

interface AuthContextType {
  user: User | null;
  dbUser: DBUser | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [dbUser, setDbUser] = useState<DBUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (firebaseUser: User) => {
    try {
      const token = await firebaseUser.getIdToken();
      
      // Store token in localStorage for other components to use
      localStorage.setItem('firebaseToken', token);
      
      const response = await fetch('/api/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const userData = await response.json();
        setDbUser(userData);
        return userData;
      } else {
        console.error("Failed to fetch user data:", response.status);
        setDbUser(null);
        localStorage.removeItem('firebaseToken');
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setDbUser(null);
      localStorage.removeItem('firebaseToken');
    }
    return null;
  };

  const refreshUser = async () => {
    if (user) {
      await fetchUserData(user);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        await fetchUserData(firebaseUser);
      } else {
        setDbUser(null);
      }
      
      setLoading(false);
    });

    // No development fallback - use actual authentication only

    return unsubscribe;
  }, []);

  const logout = async () => {
    try {
      await firebaseLogout();
      setUser(null);
      setDbUser(null);
      localStorage.removeItem('firebaseToken');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const value = {
    user,
    dbUser,
    loading,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
