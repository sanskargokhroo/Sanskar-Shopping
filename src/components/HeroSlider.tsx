"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Banner } from "@/types";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function HeroSlider() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "banners"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bannerData = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Banner[];
      setBanners(bannerData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [banners, currentIndex]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % (banners.length || 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + (banners.length || 1)) % (banners.length || 1));
  };

  if (loading) {
    return (
      <div className="w-full h-[400px] md:h-[600px] rounded-[3rem] bg-muted animate-pulse mb-16" />
    );
  }

  // Fallback if no banners are added
  if (banners.length === 0) {
    return (
      <section className="container mx-auto px-6 mb-12">
        <div className="relative w-full max-w-4xl mx-auto h-[220px] md:h-[280px] rounded-[2rem] md:rounded-[3rem] overflow-hidden bg-gradient-to-tr from-orange-500 to-purple-600 flex items-center justify-center text-center p-6 shadow-xl shadow-orange-500/10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider mb-4 mx-auto">
              <Sparkles size={12} /> Best Deals of the Day
            </div>
            <h1 className="text-2xl md:text-5xl font-black text-white mb-3 tracking-tight">
              Shop Smarter, <span className="text-white/80">Save Bigger.</span>
            </h1>
            <p className="hidden md:block text-white/90 font-medium mb-6 text-sm">
              Discover handpicked deals from top stores. Up to 90% OFF on your favorite products.
            </p>
            <Link href="/shopping" className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-orange-600 rounded-xl font-black text-sm hover:bg-orange-50 transition-colors shadow-lg">
              Explore Deals <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const currentBanner = banners[currentIndex];

  return (
    <section className="relative w-full max-w-6xl mx-auto aspect-[25/9] md:aspect-[4/1] mb-12 group px-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentBanner.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 rounded-2xl md:rounded-[3.5rem] overflow-hidden bg-[#f3f3f3]"
        >
          <Image 
            src={currentBanner.imageUrl} 
            alt={currentBanner.title} 
            fill 
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/10 flex items-center justify-center md:justify-start text-center md:text-left p-6 md:p-24">
            <div className="max-w-xl w-full">
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-lg sm:text-2xl md:text-5xl lg:text-6xl font-black text-white md:text-black mb-2 md:mb-6 leading-tight drop-shadow-sm"
              >
                {currentBanner.title}
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="hidden md:block text-lg md:text-xl text-black/70 font-semibold mb-10 max-w-md"
              >
                {currentBanner.subtitle}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Link href={currentBanner.link} className="btn-primary bg-orange-500 text-white hover:bg-orange-600 px-5 md:px-10 py-2 md:py-4 text-[10px] md:text-lg rounded-xl md:rounded-3xl shadow-xl inline-flex items-center gap-2 font-black transition-all hover:scale-105 active:scale-95">
                  SHOP NOW <ArrowRight size={14} className="md:w-6 md:h-6" />
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {banners.length > 1 && (
        <>
          <button 
            onClick={prevSlide}
            className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20"
          >
            <ChevronLeft size={32} />
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20"
          >
            <ChevronRight size={32} />
          </button>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all ${idx === currentIndex ? 'w-10 bg-orange-500' : 'w-2 bg-white/40'}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
