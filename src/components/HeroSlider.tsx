"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
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
      <section className="relative w-full h-[450px] md:h-[550px] mb-16 rounded-[3rem] overflow-hidden bg-gradient-to-tr from-orange-500 to-purple-600 flex items-center justify-center text-center p-8">
        <div className="max-w-3xl">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-widest mb-6"
          >
            🔥 Best Deals of the Day
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-white mb-8 leading-tight"
          >
            Shop Smarter, <br /> Save Bigger.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-white/80 font-medium mb-10 max-w-2xl mx-auto"
          >
            Discover handpicked deals from top stores. Up to 90% OFF on your favorite products.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Link href="/shopping" className="btn-primary bg-white text-black hover:bg-orange-50 px-8 py-3.5 text-lg rounded-2xl shadow-xl shadow-black/10">
              Explore Deals
            </Link>
          </motion.div>
        </div>
      </section>
    );
  }

  const currentBanner = banners[currentIndex];

  return (
    <section className="relative w-full aspect-[21/9] md:h-[600px] mb-12 group">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentBanner.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 rounded-2xl md:rounded-[3rem] overflow-hidden bg-black"
        >
          <Image 
            src={currentBanner.imageUrl} 
            alt={currentBanner.title} 
            fill 
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/30 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-center justify-center text-center p-3 md:p-8">
            <div className="max-w-4xl w-full">
              <motion.h1 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-base md:text-7xl font-black text-white mb-2 md:mb-6 leading-tight"
              >
                {currentBanner.title}
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="hidden md:block text-xl text-white/90 font-medium mb-10 max-w-2xl mx-auto"
              >
                {currentBanner.subtitle}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Link href={currentBanner.link} className="btn-primary bg-orange-500 text-white hover:bg-orange-600 px-4 md:px-8 py-1.5 md:py-3.5 text-[10px] md:text-lg rounded-lg md:rounded-2xl shadow-lg inline-flex items-center gap-1.5">
                  View Deal <ArrowRight size={12} className="md:w-5 md:h-5" />
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
