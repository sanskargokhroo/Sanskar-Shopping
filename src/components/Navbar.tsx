"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShoppingBag, Home, TrendingUp, LayoutGrid, Info, LogIn, LayoutDashboard, Download, LogOut } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Shopping", href: "/shopping", icon: ShoppingBag },
  { name: "Earn Money", href: "/earn", icon: TrendingUp },
  { name: "Categories", href: "/categories", icon: LayoutGrid },
  { name: "About", href: "/about", icon: Info },
];

import Image from "next/image";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowInstallBtn(false);
    }
  };

  return (
    <>
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "glass shadow-lg py-2" : "bg-transparent py-4"}`}>
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-12 h-12 relative flex items-center justify-center group-hover:scale-110 transition-transform bg-transparent border-none shadow-none">
            <Image src="/logo1.png" alt="Logo" fill className="object-contain" />
          </div>
          <span className="text-xl font-black tracking-tight gradient-text">
            Sanskar Shopping
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`text-sm font-medium hover:text-orange-500 transition-colors ${pathname === item.href ? "text-orange-500" : "text-foreground/80"}`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {showInstallBtn && (
            <button
              onClick={handleInstallClick}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl font-bold text-sm hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20"
            >
              <Download size={16} /> Install App
            </button>
          )}

          {user ? (
            <Link href="/admin/dashboard" className="p-2 rounded-xl hover:bg-orange-500/10 transition-colors text-orange-500" title="Admin Dashboard">
              <LayoutDashboard size={20} />
            </Link>
          ) : (
            <Link href="/admin/login" className="p-2 rounded-xl hover:bg-orange-500/10 transition-colors text-muted-foreground" title="Admin Login">
              <LogIn size={20} />
            </Link>
          )}

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-xl hover:bg-orange-500/10 transition-colors"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

    </nav>

    {/* Mobile Menu Backdrop */}
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] lg:hidden"
        />
      )}
    </AnimatePresence>

    {/* Mobile Menu Content */}
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-black z-[70] lg:hidden shadow-2xl p-6 flex flex-col border-l border-white/10"
        >
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <Image src="/logo1.png" alt="Logo" width={40} height={40} className="object-contain" />
              <span className="font-bold text-xl tracking-tight">Sanskar Shopping</span>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="p-3 rounded-2xl bg-white/5 text-white hover:bg-orange-500 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-5 p-5 rounded-[2rem] transition-all ${
                  pathname === item.href 
                  ? "bg-orange-500 text-white shadow-xl shadow-orange-500/30" 
                  : "hover:bg-white/5 text-gray-400 hover:text-white"
                }`}
              >
                <item.icon size={24} />
                <span className="font-bold text-xl">{item.name}</span>
              </Link>
            ))}
            
            {showInstallBtn && (
              <button
                onClick={handleInstallClick}
                className="w-full mt-6 flex items-center justify-center gap-4 p-6 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-[2.5rem] font-black text-xl shadow-2xl shadow-orange-500/20"
              >
                <Download size={28} /> Install App
              </button>
            )}
          </div>
          
          <div className="mt-auto pt-10 border-t border-white/5 text-center">
            <p className="text-gray-500 text-sm font-bold">Premium Shopping Experience</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
