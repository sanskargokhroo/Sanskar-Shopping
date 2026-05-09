"use client";

import React from "react";
import Link from "next/link";
import { Home, AlertCircle, ShoppingBag, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";

export default function ExpiredPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="text-center max-w-lg">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-32 h-32 bg-red-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border-4 border-red-500/20"
          >
            <AlertCircle size={64} className="text-red-500" />
          </motion.div>
          
          <h1 className="text-4xl md:text-5xl font-black mb-4">This offer has <span className="text-red-500">ended.</span></h1>
          <p className="text-muted-foreground text-lg mb-10 font-medium leading-relaxed">
            Oops! You missed this one. Don't worry, there are plenty of other amazing deals waiting for you on the homepage.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/" className="btn-primary py-4 px-10 flex items-center justify-center gap-2">
              <Home size={20} /> Back to Homepage
            </Link>
            <Link href="/#all-deals" className="bg-muted hover:bg-muted/80 text-foreground py-4 px-10 rounded-2xl font-bold flex items-center justify-center gap-2 border border-border transition-all">
              Explore More Deals <ArrowRight size={20} />
            </Link>
          </div>

          <div className="mt-16 pt-8 border-t border-border flex items-center justify-center gap-2 text-muted-foreground text-sm font-bold">
            <ShoppingBag size={16} /> Sanskar Shopping • Quality Deals Only
          </div>
        </div>
      </main>
    </div>
  );
}
