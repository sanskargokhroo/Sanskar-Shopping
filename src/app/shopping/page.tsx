"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import DealGrid from "@/components/DealGrid";
import { Deal } from "@/types";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ShoppingBag, Search, Filter, Layers } from "lucide-react";

export default function ShoppingPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [filteredDeals, setFilteredDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPlatform, setSelectedPlatform] = useState("All");
  const [sortBy, setSortBy] = useState("recently-added");

  useEffect(() => {
    const q = query(
      collection(db, "deals")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dealsData = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as Deal[];
      setDeals(dealsData);
      setFilteredDeals(dealsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let result = [...deals];
    
    // Filter by Deal Type & Category (Strict Separation)
    result = result.filter(d => {
      const isEarnType = d.dealType === "earn" || d.category === "Earn Money";
      return !isEarnType; // Only show non-earn deals (Shopping)
    });

    // Filter by Category
    if (selectedCategory !== "All") {
      result = result.filter(d => d.category === selectedCategory);
    }
    
    // Filter by Platform
    if (selectedPlatform !== "All") {
      result = result.filter(d => d.platform === selectedPlatform);
    }
    
    // Search
    if (searchTerm) {
      result = result.filter(d => d.title.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    
    // Sort
    if (sortBy === "price-low-to-high") {
      result.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === "price-high-to-low") {
      result.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === "recently-added") {
      result.sort((a, b) => {
        const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : (a.createdAt as any).toDate().getTime();
        const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : (b.createdAt as any).toDate().getTime();
        return dateB - dateA;
      });
    }
    
    setFilteredDeals(result);
  }, [searchTerm, selectedCategory, selectedPlatform, sortBy, deals]);

  const categories = ["Electronics", "Fashion", "Home", "Beauty", "Groceries", "Earn Money", "Other"];
  const platforms = ["Amazon", "Flipkart"];

  return (
    <main className="min-h-screen bg-background pt-24 pb-20">
      <Navbar />

      <section className="container mx-auto px-4">
        {!loading && filteredDeals.length === 0 && searchTerm === "" && selectedCategory === "All" ? (
          <div className="py-32 text-center max-w-md mx-auto">
             <div className="w-24 h-24 bg-orange-500/10 rounded-[3rem] flex items-center justify-center mx-auto mb-8">
                <ShoppingBag className="text-orange-500" size={48} />
             </div>
             <h1 className="text-4xl font-black mb-4">No Products Found</h1>
             <p className="text-muted-foreground font-medium text-lg mb-8">
                We're currently updating our inventory with the latest deals. Please check back shortly!
             </p>
             <div className="flex justify-center gap-3">
                <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce delay-75"></div>
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce delay-150"></div>
             </div>
          </div>
        ) : (
          <>
            <header className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center">
                  <ShoppingBag className="text-orange-500" size={28} />
                </div>
                <h1 className="text-4xl font-black">All <span className="gradient-text">Deals</span></h1>
              </div>
              <p className="text-muted-foreground text-lg">Browse through all our handpicked live offers.</p>
            </header>

            {/* Filters & Sorting */}
            <div className="space-y-6 mb-12">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                  <input 
                    type="text" 
                    placeholder="Search products, brands or deals..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-card border border-border focus:border-orange-500 outline-none shadow-sm"
                  />
                </div>
                
                <div className="relative min-w-[200px]">
                  <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                  <select
                    value={selectedCategory}
                    onChange={(e) => { setSelectedCategory(e.target.value); setSelectedPlatform("All"); }}
                    className="w-full pl-12 pr-10 py-4 rounded-2xl bg-card border border-border focus:border-orange-500 outline-none appearance-none shadow-sm font-bold"
                  >
                    <option value="All" className="text-black">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat} className="text-black">{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="relative min-w-[200px]">
                  <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full pl-12 pr-10 py-4 rounded-2xl bg-card border border-border focus:border-orange-500 outline-none appearance-none shadow-sm font-bold"
                  >
                    <option value="recently-added" className="text-black">Recently Added</option>
                    <option value="price-low-to-high" className="text-black">Price: Low to High</option>
                    <option value="price-high-to-low" className="text-black">Price: High to Low</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                <button
                  onClick={() => { setSelectedCategory("All"); setSelectedPlatform("All"); }}
                  className={`px-6 py-3 rounded-2xl font-bold whitespace-nowrap transition-all border ${
                    selectedCategory === "All" && selectedPlatform === "All"
                    ? 'bg-orange-500 text-white border-orange-500 shadow-lg' 
                    : 'bg-card text-muted-foreground border-border hover:border-orange-500/50'
                  }`}
                >
                  All
                </button>
                
                {platforms.map((plat) => (
                  <button
                    key={plat}
                    onClick={() => { setSelectedPlatform(plat); setSelectedCategory("All"); }}
                    className={`px-6 py-3 rounded-2xl font-bold whitespace-nowrap transition-all border ${
                      selectedPlatform === plat 
                      ? 'bg-blue-500 text-white border-blue-500 shadow-lg' 
                      : 'bg-card text-muted-foreground border-border hover:border-blue-500/50'
                    }`}
                  >
                    {plat}
                  </button>
                ))}
              </div>
            </div>

            <DealGrid deals={filteredDeals} loading={loading} simpleEmptyState />
          </>
        )}
      </section>
    </main>
  );
}
