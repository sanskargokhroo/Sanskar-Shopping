"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Deal } from "@/types";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import { 
  Share2, Link as LinkIcon, ExternalLink, 
  Clock, Tag, ShieldCheck, ChevronLeft,
  Flame, Sparkles, TrendingUp
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

export default function DealDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeal = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, "deals", id as string);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const expiresAt = (data?.expiresAt as any).toDate();
          
          if (expiresAt < new Date()) {
            router.push("/expired");
            return;
          }
          
          setDeal({ ...data, id: docSnap.id } as Deal);
        } else {
          router.push("/");
        }
      } catch (error) {
        console.error("Error fetching deal:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeal();
  }, [id, router]);

  const handleGrabDeal = async () => {
    if (!deal) return;
    try {
      // Increment click count
      const docRef = doc(db, "deals", deal.id);
      await updateDoc(docRef, { clickCount: increment(1) });
      
      // Redirect in new tab
      window.open(deal.redirectUrl, "_blank");
    } catch (error) {
      console.error("Error updating click count:", error);
      window.open(deal.redirectUrl, "_blank");
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading amazing deal...</div>;
  if (!deal) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-32 pb-20">
        <button 
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-orange-500 mb-8 transition-colors group"
        >
          <ChevronLeft className="group-hover:-translate-x-1 transition-transform" /> Back to Deals
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Image Column */}
          <div className="lg:col-span-7">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative aspect-square md:aspect-video rounded-[3rem] overflow-hidden shadow-2xl border border-border"
            >
              <Image 
                src={deal.imageUrl} 
                alt={deal.title} 
                fill 
                className="object-cover" 
                priority
              />
              <div className="absolute top-6 left-6 flex flex-col gap-3">
                <div className="bg-orange-500 text-white px-6 py-2 rounded-2xl text-xl font-black shadow-xl">
                  {deal.offerPercentage}% OFF
                </div>
                {deal.status === 'live' && (
                  <div className="bg-red-500 text-white px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 animate-live w-fit">
                    <span className="w-2 h-2 bg-white rounded-full"></span> LIVE DEAL
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Details Column */}
          <div className="lg:col-span-5 flex flex-col">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-8 md:p-10 rounded-[3rem] flex-1"
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="px-4 py-1.5 rounded-full bg-orange-500/10 text-orange-500 text-xs font-black uppercase tracking-widest border border-orange-500/20">
                  {deal.category}
                </span>
                <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-bold">
                  <Clock size={14} />
                  {formatDistanceToNow(deal.createdAt instanceof Date ? deal.createdAt : (deal.createdAt as any).toDate())} ago
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl font-black mb-6 leading-tight">
                {deal.title}
              </h1>

              {deal.description && (
                <div className="mb-8">
                  <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                    <Tag size={14} /> Description
                  </h3>
                  <p className="text-foreground/80 leading-relaxed font-medium">
                    {deal.description}
                  </p>
                </div>
              )}

              <div className="mt-auto space-y-6">
                <div className="flex items-center gap-2 text-green-500 font-bold text-sm bg-green-500/10 p-4 rounded-2xl border border-green-500/20">
                  <ShieldCheck size={20} /> Verified Deal • Handpicked for you
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={copyLink}
                    className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-muted border border-border hover:bg-muted/80 transition-colors font-bold text-sm"
                  >
                    <LinkIcon size={18} /> Copy Link
                  </button>
                  <button 
                    className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-muted border border-border hover:bg-muted/80 transition-colors font-bold text-sm"
                  >
                    <Share2 size={18} /> Share
                  </button>
                </div>

                <button 
                  onClick={handleGrabDeal}
                  className="w-full btn-primary py-5 text-xl flex items-center justify-center gap-3 group/btn"
                >
                  Grab This Deal Now
                  <ExternalLink className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                </button>

                <div className="flex items-center justify-center gap-6 pt-4 border-t border-border">
                  <div className="flex flex-col items-center">
                    <span className="text-xl font-black">{deal.clickCount || 0}</span>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">Clicks</span>
                  </div>
                  <div className="w-px h-8 bg-border"></div>
                  <div className="flex flex-col items-center">
                    <span className="text-xl font-black text-orange-500">{deal.offerPercentage}%</span>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">Savings</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
