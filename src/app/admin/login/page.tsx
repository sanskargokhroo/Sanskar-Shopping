"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ShoppingBag, ArrowRight, Globe, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminLogin() {
  const { user, loading: authLoading, loginWithGoogle } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user) {
      router.push("/admin/dashboard");
    }
  }, [user, authLoading, router]);

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setError(null);
    try {
      await loginWithGoogle();
      // The logic in AuthContext will throw if not an admin
    } catch (err: any) {
      setError("Access Denied: Only admin can access.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--background)]">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-3 mb-8 group">
            <div className="w-14 h-14 relative group-hover:rotate-12 transition-transform">
              <Image src="/logo.png" alt="Logo" fill className="object-contain" />
            </div>
            <span className="text-3xl font-black">Sanskar <span className="gradient-text">Admin</span></span>
          </Link>
          <h2 className="text-4xl font-black mb-3 italic">Portal Access</h2>
          <p className="text-muted-foreground font-medium">Restricted to authorized administrators only.</p>
        </div>

        <div className="glass-card p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
          {/* Custom Website Style Modal */}
          <AnimatePresence>
            {error && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-md">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="glass-card p-10 rounded-[3rem] shadow-2xl max-w-sm w-full text-center border-t border-white/20"
                >
                  <div className="w-20 h-20 bg-gradient-to-tr from-orange-500/20 to-pink-500/20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-orange-500/20">
                    <ShoppingBag className="text-orange-500" size={32} />
                  </div>
                  
                  <h3 className="text-2xl font-black mb-4 leading-tight">
                    Sorry, only <span className="gradient-text">admin</span> can access
                  </h3>
                  
                  <p className="text-muted-foreground font-medium mb-10 text-sm">
                    This portal is restricted to authorized users only. 
                  </p>

                  <button 
                    onClick={() => setError(null)}
                    className="w-full py-4 bg-white text-black hover:bg-orange-50 font-black rounded-2xl transition-all shadow-xl shadow-black/5 active:scale-95"
                  >
                    OK
                  </button>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

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
