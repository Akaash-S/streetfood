import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, onAuthChange, logout as firebaseLogout } from "@/lib/firebase";
import { User } from "firebase/auth";
import { User as DBUser } from "@shared/schema";

interface AuthContextType {
  user: User | null;
  dbUser: DBUser | null;
  loading: boolean;
  logout: () => Promise<void>;
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

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          // Get user data from our database using Firebase UID
          const token = await firebaseUser.getIdToken();
          const response = await fetch('/api/users/me', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (response.ok) {
            const userData = await response.json();
            setDbUser(userData);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setDbUser(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    try {
      await firebaseLogout();
      setUser(null);
      setDbUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const value = {
    user,
    dbUser,
    loading,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
