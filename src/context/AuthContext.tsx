"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  onAuthStateChanged, 
  User, 
  signInWithPopup, 
  signOut as firebaseSignOut 
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import toast from "react-hot-toast";

// List of allowed admin emails. 
// TIP: You can also use process.env.NEXT_PUBLIC_ADMIN_EMAIL
const ALLOWED_ADMINS = [
  "sanskargokhroo1@gmail.com",
];

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true,
  loginWithGoogle: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      // If user is logged in but not an admin, log them out immediately
      if (currentUser && currentUser.email && !ALLOWED_ADMINS.includes(currentUser.email)) {
        firebaseSignOut(auth);
        setUser(null);
        toast.error("Access Denied: You are not an authorized admin.");
      } else {
        setUser(currentUser);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const loggedUser = result.user;
      
      if (loggedUser.email && !ALLOWED_ADMINS.includes(loggedUser.email)) {
        await firebaseSignOut(auth);
        throw new Error("Unauthorized email address.");
      }
      
      toast.success("Welcome back, Admin!");
    } catch (error: any) {
      console.error(error);
      if (error.message === "Unauthorized email address.") {
        toast.error("Access Denied: This account is not an admin.");
      } else {
        toast.error("Login failed. Please try again.");
      }
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
