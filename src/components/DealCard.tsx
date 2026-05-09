"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Share2, Link as LinkIcon, ExternalLink, Clock } from "lucide-react";
import { Deal } from "@/types";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import { db } from "@/lib/firebase";
import { doc, updateDoc, increment } from "firebase/firestore";

interface DealCardProps {
  deal: Deal;
}

export default function DealCard({ deal }: DealCardProps) {
  const shareLink = `${window.location.origin}/deal/${deal.id}`;

  const copyToClipboard = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(shareLink);
    toast.success("Link copied to clipboard!");
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: deal.title,
          text: `Check out this amazing deal: ${deal.offerPercentage}% OFF!`,
          url: shareLink,
        });
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      copyToClipboard(e);
    }
  };

  const handleRedirect = async () => {
    try {
      const dealRef = doc(db, "deals", deal.id);
      await updateDoc(dealRef, {
        clickCount: increment(1)
      });
    } catch (error) {
      console.error("Error tracking click:", error);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      className="group relative bg-card rounded-3xl overflow-hidden shadow-lg border border-border transition-all duration-300"
    >
      {/* Image Container - Direct Redirect */}
      <a 
        href={deal.redirectUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        onClick={handleRedirect}
        className="block relative aspect-[4/5] overflow-hidden"
      >
        <Image
          src={deal.imageUrl}
          alt={deal.title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {deal.status === 'live' && (
            <div className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 animate-live">
              <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
              LIVE
            </div>
          )}
        </div>

      </a>

      {/* Content */}
      <div className="p-4">
        {/* Title - Direct Redirect */}
        <a 
          href={deal.redirectUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          onClick={handleRedirect}
        >
          <h3 className="font-bold text-sm md:text-base line-clamp-2 min-h-[2.5rem] group-hover:text-orange-500 transition-colors">
            {deal.title}
          </h3>
        </a>

        {deal.price > 0 && !(deal.dealType === 'earn' || deal.category === 'Earn Money') && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xl font-black text-foreground">₹{deal.price}</span>
            {deal.originalPrice > 0 && (
              <span className="text-xs text-muted-foreground line-through font-medium">₹{deal.originalPrice}</span>
            )}
            {deal.offerPercentage > 0 && (
              <span className="ml-auto text-xs font-bold text-orange-500 bg-orange-500/10 px-2 py-1 rounded-lg">
                {deal.offerPercentage}% OFF
              </span>
            )}
          </div>
        )}

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-medium">
            <Clock size={12} />
            {formatDistanceToNow(deal.createdAt instanceof Date ? deal.createdAt : (deal.createdAt as any).toDate())} ago
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={copyToClipboard}
              className="p-2 rounded-full hover:bg-orange-500/10 transition-colors text-muted-foreground hover:text-orange-500"
              title="Copy link"
            >
              <LinkIcon size={16} />
            </button>
            <button
              onClick={handleShare}
              className="p-2 rounded-full hover:bg-orange-500/10 transition-colors text-muted-foreground hover:text-orange-500"
              title="Share deal"
            >
              <Share2 size={16} />
            </button>
          </div>
        </div>

        {/* Action Button */}
        <a
          href={deal.redirectUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleRedirect}
          className="mt-4 w-full btn-primary py-2.5 text-sm flex items-center justify-center gap-2 group/btn"
        >
          {deal.dealType === 'earn' || deal.category === 'Earn Money' ? 'Start Earning' : 'Grab Deal'}
          <ExternalLink size={14} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
        </a>
      </div>
    </motion.div>
  );
}
