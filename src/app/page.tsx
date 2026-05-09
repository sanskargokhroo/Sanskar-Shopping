"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import DealGrid from "@/components/DealGrid";
import { Deal } from "@/types";
import { collection, query, where, orderBy, limit, onSnapshot, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion } from "framer-motion";
import HeroSlider from "@/components/HeroSlider";
import { TrendingUp, Sparkles, ShoppingBag } from "lucide-react";

export default function Home() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [featuredDeals, setFeaturedDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPlatform, setSelectedPlatform] = useState("All");
  const [filteredDeals, setFilteredDeals] = useState<Deal[]>([]);

  useEffect(() => {
    // Real-time listener for all live deals
    const q = query(
      collection(db, "deals"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dealsData = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as Deal[];
      
      setDeals(dealsData);
      setFeaturedDeals(dealsData.filter(d => d.featured));
      setFilteredDeals(dealsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching deals:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let result = deals.filter(d => {
      const isEarnType = d.dealType === "earn" || d.category === "Earn Money";
      return !isEarnType; // Only show non-earn deals
    });
    if (selectedCategory !== "All") {
      result = result.filter(d => d.category === selectedCategory);
    }
    if (selectedPlatform !== "All") {
      result = result.filter(d => d.platform === selectedPlatform);
    }
    setFilteredDeals(result);
  }, [deals, selectedCategory, selectedPlatform]);

  return (
    <main className="flex-1 pt-24 pb-20">
      <Navbar />

      {/* Dynamic Hero Slider */}
      <section className="container mx-auto px-4">
        <HeroSlider />
      </section>

      {/* Main Content Area */}
      {!loading && deals.length === 0 ? (
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-md mx-auto glass-card p-12 rounded-[3rem] border-2 border-dashed border-orange-500/20">
            <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="text-orange-500" size={40} />
            </div>
            <h2 className="text-3xl font-black mb-4">No Offers Found</h2>
            <p className="text-muted-foreground font-medium mb-8">
              We're currently scouting for the best deals. Please check back in a few hours!
            </p>
            <div className="flex justify-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        </section>
      ) : (
        <>
          {/* Featured Deals */}
          {featuredDeals.length > 0 && (
            <section className="container mx-auto px-4 mb-16">
              <div className="flex items-center gap-2 mb-8">
                <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center">
                  <Sparkles className="text-orange-500" size={24} />
                </div>
                <h2 className="text-2xl font-black">Featured <span className="gradient-text">Offers</span></h2>
              </div>
              <DealGrid deals={featuredDeals} loading={loading} />
            </section>
          )}



          {/* All Deals */}
          {(loading || deals.length > 0) && (
            <section id="all-deals" className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
                    <TrendingUp className="text-purple-500" size={24} />
                  </div>
                  <h2 className="text-2xl font-black">Fresh <span className="gradient-text">Deals</span></h2>
                </div>
                
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar max-w-full md:max-w-none">
                  <button
                    onClick={() => { setSelectedCategory("All"); setSelectedPlatform("All"); }}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                      selectedCategory === "All" && selectedPlatform === "All"
                      ? 'bg-orange-500 text-white border-orange-500' 
                      : 'border-border hover:bg-orange-500/10'
                    }`}
                  >
                    All
                  </button>
                  
                  {['Amazon', 'Flipkart'].map((plat) => (
                    <button
                      key={plat}
                      onClick={() => { setSelectedPlatform(plat); setSelectedCategory("All"); }}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                        selectedPlatform === plat 
                        ? 'bg-blue-500 text-white border-blue-500' 
                        : 'border-border hover:bg-blue-500/10'
                      }`}
                    >
                      {plat}
                    </button>
                  ))}
                </div>
              </div>
              <DealGrid deals={filteredDeals} loading={loading} />
            </section>
          )}
        </>
      )}
    </main>
  );
}
