"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import DealGrid from "@/components/DealGrid";
import { Deal } from "@/types";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Calendar, Bell, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function UpcomingSales() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "deals"),
      where("status", "==", "upcoming"),
      orderBy("createdAt", "desc")
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
        {/* Featured Upcoming Announcement */}
        <div className="mb-16 relative rounded-[3rem] overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-8 md:p-16 text-white">
          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-2 mb-6">
              <span className="bg-white/20 backdrop-blur-md px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                Mega Sale Alert
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
              Big Billion Days <br />
              <span className="text-blue-200 text-3xl md:text-5xl">Coming Next Week!</span>
            </h1>
            <p className="text-white/80 text-lg mb-8 font-medium">
              Get ready for the biggest sale of the year. Bookmark your favorite deals and be the first to grab them.
            </p>
            <button className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-xl">
              <Bell size={20} /> Remind Me
            </button>
          </div>
          
          <div className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 opacity-10">
            <Calendar size={400} />
          </div>
        </div>

        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
              <Calendar className="text-blue-500" size={28} />
            </div>
            <h2 className="text-4xl font-black">Upcoming <span className="gradient-text">Sales</span></h2>
          </div>
          <p className="text-muted-foreground text-lg">Don't miss out! Here are the deals starting soon.</p>
        </header>

        {deals.length > 0 ? (
          <DealGrid deals={deals} loading={loading} simpleEmptyState />
        ) : !loading && (
          <div className="glass-card p-20 rounded-[3rem] text-center">
            <Sparkles className="mx-auto text-orange-500 mb-6" size={64} />
            <h3 className="text-2xl font-black mb-2">No upcoming sales yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              We are constantly scouting for new deals. Check back soon for exciting upcoming offers!
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
