"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import { ShoppingBag, Heart, ShieldCheck, Zap, ArrowRight, MessageCircle } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background pt-24 pb-20">
      <Navbar />

      <section className="container mx-auto px-4">
        {/* Story Section */}
        <div className="max-w-4xl mx-auto mb-24">
          <header className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight">
              We find the <span className="gradient-text">Deals</span>, <br />
              You do the <span className="text-orange-500">Shopping.</span>
            </h1>
            <p className="text-xl text-muted-foreground font-medium leading-relaxed">
              Sanskar Shopping is a dedicated platform built to help you save money on every purchase. We curate the best offers from across the web so you don't have to.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-card p-10 rounded-[3rem]">
              <div className="w-14 h-14 bg-pink-500/10 rounded-2xl flex items-center justify-center mb-6">
                <Heart className="text-pink-500" size={28} />
              </div>
              <h3 className="text-2xl font-black mb-4">Our Mission</h3>
              <p className="text-muted-foreground font-medium leading-relaxed">
                To democratize savings by making the best deals accessible to everyone, instantly. No signups, no hidden fees, just pure savings.
              </p>
            </div>
            <div className="glass-card p-10 rounded-[3rem]">
              <div className="w-14 h-14 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-6">
                <Zap className="text-orange-500" size={28} />
              </div>
              <h3 className="text-2xl font-black mb-4">How it Works</h3>
              <p className="text-muted-foreground font-medium leading-relaxed">
                Our team (and community soon!) scouts for price drops, hidden coupons, and flash sales. Once verified, they appear right here for you.
              </p>
            </div>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="bg-gradient-to-tr from-orange-500/5 to-purple-600/5 rounded-[4rem] p-12 md:p-24 mb-24">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="text-5xl font-black text-orange-500 mb-4">100%</div>
              <p className="font-bold uppercase tracking-widest text-xs text-muted-foreground">Free to use</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-black text-pink-500 mb-4">24/7</div>
              <p className="font-bold uppercase tracking-widest text-xs text-muted-foreground">Deal Updates</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-black text-purple-600 mb-4">1k+</div>
              <p className="font-bold uppercase tracking-widest text-xs text-muted-foreground">Happy Shoppers</p>
            </div>
          </div>
        </div>

        {/* Community Section */}
        <div className="max-w-4xl mx-auto glass-card p-12 md:p-20 rounded-[4rem] text-center overflow-hidden relative">
          <div className="relative z-10">
            <h2 className="text-4xl font-black mb-6">Join our Community</h2>
            <p className="text-muted-foreground text-lg mb-10 font-medium max-w-xl mx-auto">
              Never miss a deal again! Join our WhatsApp community and get instant alerts for the hottest offers, flash sales, and exclusive coupons.
            </p>
            <a 
              href="https://chat.whatsapp.com/LxhFB9qFyOx2bt4eBbwq0R" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-primary px-12 py-5 text-xl inline-flex items-center gap-3 bg-green-500 hover:bg-green-600 border-none shadow-green-500/20"
            >
              <MessageCircle size={24} /> Join WhatsApp Group
            </a>
          </div>
          
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-green-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl"></div>
        </div>
      </section>
    </main>
  );
}
