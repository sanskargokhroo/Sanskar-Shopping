"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import DealGrid from "@/components/DealGrid";
import { Deal } from "@/types";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DollarSign, Wallet, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export default function EarnMoney() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "deals"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allDeals = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as Deal[];

      // Filter for Earn Money deals only
      const earnDeals = allDeals.filter(d => d.dealType === "earn" || d.category === "Earn Money")
        .sort((a, b) => {
          const dateA = a.createdAt instanceof Date ? a.createdAt : (a.createdAt as any)?.toDate() || new Date(0);
          const dateB = b.createdAt instanceof Date ? b.createdAt : (b.createdAt as any)?.toDate() || new Date(0);
          return dateB.getTime() - dateA.getTime();
        });

      setDeals(earnDeals);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <main className="min-h-screen bg-background pt-24 pb-20">
      <Navbar />

      <section className="container mx-auto px-4">
        <header className="mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block p-4 rounded-3xl bg-green-500/10 mb-6"
          >
            <DollarSign className="text-green-500" size={40} />
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            Best <span className="gradient-text">Earning</span> Deals
          </h1>
          <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
            Discover the highest paying referral offers, cashback tricks, and side hustle opportunities.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
           <div className="glass-card p-8 rounded-[2.5rem] flex items-center gap-6">
              <div className="w-14 h-14 bg-orange-500/10 rounded-2xl flex items-center justify-center">
                 <Wallet className="text-orange-500" size={28} />
              </div>
              <div>
                 <h3 className="text-xl font-black">Daily Loot</h3>
                 <p className="text-sm text-muted-foreground font-medium">Handpicked earning tricks</p>
              </div>
           </div>
           <div className="glass-card p-8 rounded-[2.5rem] flex items-center gap-6">
              <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center">
                 <TrendingUp className="text-blue-500" size={28} />
              </div>
              <div>
                 <h3 className="text-xl font-black">High Payouts</h3>
                 <p className="text-sm text-muted-foreground font-medium">Verified referral rewards</p>
              </div>
           </div>
           <div className="glass-card p-8 rounded-[2.5rem] flex items-center gap-6">
              <div className="w-14 h-14 bg-pink-500/10 rounded-2xl flex items-center justify-center">
                 <DollarSign className="text-pink-500" size={28} />
              </div>
              <div>
                 <h3 className="text-xl font-black">Fast Cash</h3>
                 <p className="text-sm text-muted-foreground font-medium">Instant withdrawal apps</p>
              </div>
           </div>
        </div>

        <DealGrid deals={deals} loading={loading} simpleEmptyState />
      </section>
    </main>
  );
}
