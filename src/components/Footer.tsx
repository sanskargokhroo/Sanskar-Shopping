"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Globe, MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border pt-20 pb-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-16">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 relative">
                <Image src="/logo7.png" alt="Logo" fill className="object-contain" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                Sanskar <span className="gradient-text">Shopping</span>
              </span>
            </Link>
            <p className="text-muted-foreground font-medium leading-relaxed">
              Your ultimate destination for the most amazing shopping deals and discounts. We bring the best of the web to your fingertips.
            </p>

          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-black text-lg mb-6 uppercase tracking-widest text-foreground/50">Quick Links</h4>
            <ul className="space-y-4">
              {[
                { name: "Home", href: "/" },
                { name: "Shopping", href: "/shopping" },
                { name: "Earn Money", href: "/earn" },
                { name: "Categories", href: "/categories" }
              ].map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-muted-foreground hover:text-orange-500 font-bold transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-black text-lg mb-6 uppercase tracking-widest text-foreground/50">Categories</h4>
            <ul className="space-y-4">
              {["Electronics", "Fashion", "Home & Living", "Beauty & Care", "Food & Groceries"].map((cat) => (
                <li key={cat}>
                  <Link href={`/shopping?category=${cat}`} className="text-muted-foreground hover:text-orange-500 font-bold transition-colors">
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="font-black text-lg mb-6 uppercase tracking-widest text-foreground/50">Join Community</h4>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="text-green-500" size={20} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase text-muted-foreground mb-1">WhatsApp Group</p>
                  <a href="https://chat.whatsapp.com/LxhFB9qFyOx2bt4eBbwq0R" target="_blank" rel="noopener noreferrer" className="font-bold hover:text-green-500 transition-colors">
                    Click to Join Deals Channel
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <Globe className="text-blue-500" size={20} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase text-muted-foreground mb-1">Status</p>
                  <p className="font-bold">Active 24/7</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-10 border-t border-border text-center">
          <p className="text-muted-foreground text-sm font-bold">
            © 2026 | All rights reserved | Sanskar Solution | Sanskar Gokhroo
          </p>
        </div>
      </div>
    </footer>
  );
}
