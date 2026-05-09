"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShoppingBag, Home, TrendingUp, LayoutGrid, Info, Sun, Moon, LogIn, LayoutDashboard } from "lucide-react";
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

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden glass border-t border-white/10 overflow-hidden"
          >
            <div className="container mx-auto px-4 py-6 flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${pathname === item.href ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30" : "hover:bg-orange-500/10"}`}
                >
                  <item.icon size={20} />
                  <span className="font-semibold">{item.name}</span>
                </Link>
              ))}
              
              {showInstallBtn && (
                <button
                  onClick={handleInstallClick}
                  className="w-full mt-4 flex items-center justify-center gap-3 p-5 bg-orange-500 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-orange-500/20"
                >
                  <Download size={24} /> Install Mobile App
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
