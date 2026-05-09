"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ShoppingBag, ArrowRight, Globe } from "lucide-react";
import Link from "next/link";

export default function AdminLogin() {
  const { user, loading: authLoading, loginWithGoogle } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user) {
      router.push("/admin/dashboard");
    }
  }, [user, authLoading, router]);

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    await loginWithGoogle();
    setIsLoggingIn(false);
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--background)]">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-3 mb-8 group">
            <div className="w-14 h-14 bg-gradient-to-tr from-orange-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
              <ShoppingBag className="text-white w-8 h-8" />
            </div>
            <span className="text-3xl font-black">Sanskar <span className="gradient-text">Admin</span></span>
          </Link>
          <h2 className="text-4xl font-black mb-3 italic">Portal Access</h2>
          <p className="text-muted-foreground font-medium">Restricted to authorized administrators only.</p>
        </div>

        <div className="glass-card p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <button
            onClick={handleGoogleLogin}
            disabled={isLoggingIn}
            className="w-full bg-white dark:bg-zinc-900 text-foreground border-2 border-border py-5 rounded-[2rem] font-black text-lg flex items-center justify-center gap-4 hover:border-orange-500 transition-all group shadow-xl"
          >
            <div className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center group-hover:bg-orange-500 transition-colors">
               <Globe className="text-orange-500 group-hover:text-white transition-colors" size={20} />
            </div>
            {isLoggingIn ? "Verifying Admin..." : "Sign in with Google"}
            {!isLoggingIn && <ArrowRight size={20} className="text-muted-foreground group-hover:text-orange-500 transition-colors" />}
          </button>

          <p className="mt-8 text-center text-xs text-muted-foreground font-bold uppercase tracking-widest opacity-50">
             Security Level: High
          </p>
        </div>
        
        <p className="text-center mt-10 text-sm font-bold">
           <Link href="/" className="text-muted-foreground hover:text-orange-500 transition-colors">← Back to Shopping</Link>
        </p>
      </div>
    </div>
  );
}
