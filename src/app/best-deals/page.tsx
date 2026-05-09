"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import DealGrid from "@/components/DealGrid";
import { Deal } from "@/types";
import { collection, query, where, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { TrendingUp, Award, Flame } from "lucide-react";

export default function BestDeals() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Top 20 deals by click count
    const q = query(
      collection(db, "deals"),
      where("status", "==", "live"),
      where("expiresAt", ">", new Date()),
      orderBy("clickCount", "desc"),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dealsData = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as Deal[];
      setDeals(dealsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <main className="min-h-screen bg-background pt-24 pb-20">
      <Navbar />

      <section className="container mx-auto px-4">
        <header className="mb-12 text-center max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-yellow-500/10 flex items-center justify-center mx-auto mb-6 border border-yellow-500/20">
            <Award className="text-yellow-500" size={32} />
          </div>
          <h1 className="text-5xl font-black mb-6">Best <span className="gradient-text">Deals</span></h1>
          <p className="text-muted-foreground text-lg font-medium leading-relaxed">
            The most popular offers as voted by our community. These deals are trending fast, so grab them before they're gone!
          </p>
        </header>

        <div className="flex items-center gap-2 mb-8 justify-center">
           <Flame className="text-orange-500" size={20} />
           <span className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">Most Clicked Offers</span>
           <Flame className="text-orange-500" size={20} />
        </div>

        <DealGrid deals={deals} loading={loading} />
      </section>
    </main>
  );
}
