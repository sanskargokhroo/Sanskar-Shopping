"use client";

import React from "react";
import DealCard from "./DealCard";
import { Deal } from "@/types";
import { motion } from "framer-motion";

interface DealGridProps {
  deals: Deal[];
  loading?: boolean;
  simpleEmptyState?: boolean;
}

export default function DealGrid({ deals, loading, simpleEmptyState }: DealGridProps) {
  if (loading) {
    return (
      <div className="py-20 text-center">
        <p className="text-orange-500 font-black text-xl animate-pulse">Loading amazing deals...</p>
      </div>
    );
  }

  if (deals.length === 0) {
    if (simpleEmptyState) {
      return (
        <div className="p-10 text-center bg-muted/30 rounded-[2.5rem] border border-dashed border-border">
          <p className="text-muted-foreground font-medium">No products found in this category yet.</p>
        </div>
      );
    }
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">🛍️</div>
        <h3 className="text-xl font-bold mb-2">No deals found</h3>
        <p className="text-muted-foreground">Check back later for amazing offers!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
      {deals.map((deal) => (
        <DealCard key={deal.id} deal={deal} />
      ))}
    </div>
  );
}
