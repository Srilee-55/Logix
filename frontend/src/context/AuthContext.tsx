import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export interface User {
  user_id: string;
  email: string;
  name: string;
  created_at?: string;
  last_login?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, name?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('logix_session_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user && db) {
      const userId = user.user_id || `user_${user.email.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
      try {
        setDoc(
          doc(db, 'users', userId),
          {
            user_id: userId,
            email: user.email,
            name: user.name,
            last_login: new Date().toISOString(),
          },
          { merge: true }
        ).catch((err) => console.warn('Firestore user sync warning:', err));
      } catch (err) {
        console.warn('Firestore user sync error:', err);
      }
    }
  }, [user]);

  const login = async (email: string, name?: string) => {
    const displayName = name || email.split('@')[0] || 'User';
    const userId = `user_${email.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    const userObj: User = {
      user_id: userId,
      email,
      name: displayName,
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString(),
    };

    setUser(userObj);
    localStorage.setItem('logix_session_user', JSON.stringify(userObj));

    if (db) {
      try {
        await setDoc(
          doc(db, 'users', userId),
          {
            user_id: userId,
            email: email,
            name: displayName,
            created_at: new Date().toISOString(),
            last_login: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (err) {
        console.warn('Firestore user sync on login warning:', err);
      }
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('logix_session_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
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
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

