"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import DealGrid from "@/components/DealGrid";
import { Deal } from "@/types";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { LayoutGrid, ArrowRight, Laptop, Shirt, Home, Sparkles, ShoppingBasket, Gift } from "lucide-react";
import Link from "next/link";

const CATEGORIES_CONFIG = [
  { name: "Electronics", icon: Laptop, color: "text-blue-500", bg: "bg-blue-500/10" },
  { name: "Fashion", icon: Shirt, color: "text-pink-500", bg: "bg-pink-500/10" },
  { name: "Home", icon: Home, color: "text-orange-500", bg: "bg-orange-500/10" },
  { name: "Beauty", icon: Sparkles, color: "text-purple-500", bg: "bg-purple-500/10" },
  { name: "Groceries", icon: ShoppingBasket, color: "text-green-500", bg: "bg-green-500/10" },
  { name: "Services", icon: Gift, color: "text-indigo-500", bg: "bg-indigo-500/10" },
];

export default function CategoriesPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "deals"),
      where("status", "==", "live"),
      where("expiresAt", ">", new Date())
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
        <header className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center">
              <LayoutGrid className="text-orange-500" size={28} />
            </div>
            <h1 className="text-4xl font-black">Browse by <span className="gradient-text">Category</span></h1>
          </div>
          <p className="text-muted-foreground text-lg">Find exactly what you're looking for, organized by interest.</p>
        </header>

        <div className="space-y-20">
          {CATEGORIES_CONFIG.map((cat) => {
            const catDeals = deals.filter(d => d.category === cat.name).slice(0, 5);
            
            return (
              <div key={cat.name}>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl ${cat.bg} flex items-center justify-center shadow-sm`}>
                      <cat.icon className={cat.color} size={28} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black">{cat.name}</h2>
                      <p className="text-sm text-muted-foreground font-medium">
                        {deals.filter(d => d.category === cat.name).length} Deals available
                      </p>
                    </div>
                  </div>
                  <Link 
                    href={`/shopping?category=${cat.name}`} 
                    className="flex items-center gap-2 text-sm font-bold text-orange-500 hover:gap-3 transition-all"
                  >
                    View All <ArrowRight size={16} />
                  </Link>
                </div>

                <DealGrid deals={catDeals} loading={loading} simpleEmptyState />
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
