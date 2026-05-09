"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Deal } from "@/types";
import { 
  Plus, Search, Edit2, Trash2, ExternalLink, 
  TrendingUp, CheckCircle2, Clock, XCircle, 
  BarChart3, Settings, LogOut, ShoppingBag, 
  Star, StarOff, MoreVertical
} from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";
import Link from "next/link";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/admin/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "deals"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dealsData = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as Deal[];
      setDeals(dealsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this deal?")) {
      try {
        await deleteDoc(doc(db, "deals", id));
        toast.success("Deal deleted successfully");
      } catch (error) {
        toast.error("Failed to delete deal");
      }
    }
  };

  const toggleFeatured = async (id: string, current: boolean) => {
    try {
      await updateDoc(doc(db, "deals", id), { featured: !current });
      toast.success(`Deal ${!current ? "featured" : "unfeatured"}`);
    } catch (error) {
      toast.error("Update failed");
    }
  };

  const stats = {
    total: deals.length,
    live: deals.filter(d => d.status === 'live').length,
    upcoming: deals.filter(d => d.status === 'upcoming').length,
    expired: deals.filter(d => d.status === 'ended' || (d.expiresAt as any).toDate() < new Date()).length
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/admin/login");
  };

  if (authLoading || !user) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 glass border-r border-border hidden lg:flex flex-col p-6 fixed h-full">
        <Link href="/" className="flex items-center gap-2 mb-10 group">
          <div className="w-10 h-10 bg-gradient-to-tr from-orange-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
            <ShoppingBag className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold">Sanskar <span className="gradient-text">Admin</span></span>
        </Link>

        <nav className="flex-1 space-y-2">
          <button className="w-full flex items-center gap-3 p-4 rounded-2xl bg-orange-500 text-white font-bold shadow-lg shadow-orange-500/20">
            <BarChart3 size={20} /> Dashboard
          </button>
          <Link href="/admin/deals/new" className="w-full flex items-center gap-3 p-4 rounded-2xl hover:bg-orange-500/10 transition-colors font-medium">
            <Plus size={20} /> Add New Deal
          </Link>
          <Link href="/admin/banners" className="w-full flex items-center gap-3 p-4 rounded-2xl hover:bg-orange-500/10 transition-colors font-medium">
            <Star size={20} /> Manage Banners
          </Link>
          <button className="w-full flex items-center gap-3 p-4 rounded-2xl hover:bg-orange-500/10 transition-colors font-medium">
            <Settings size={20} /> Settings
          </button>
        </nav>

        <button onClick={handleLogout} className="mt-auto flex items-center gap-3 p-4 rounded-2xl text-red-500 hover:bg-red-500/10 transition-colors font-bold">
          <LogOut size={20} /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-4 md:p-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black mb-1">Dashboard Overview</h1>
            <p className="text-muted-foreground">Manage your shopping deals and track performance.</p>
          </div>
          <Link href="/admin/deals/new" className="btn-primary flex items-center justify-center gap-2">
            <Plus size={20} /> New Deal
          </Link>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Deals", value: stats.total, icon: BarChart3, color: "text-purple-500", bg: "bg-purple-500/10" },
            { label: "Live Deals", value: stats.live, icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
            { label: "Upcoming", value: stats.upcoming, icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10" },
            { label: "Expired", value: stats.expired, icon: XCircle, color: "text-red-500", bg: "bg-red-500/10" },
          ].map((stat) => (
            <div key={stat.label} className="glass-card p-6 rounded-3xl">
              <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center mb-4`}>
                <stat.icon className={stat.color} size={24} />
              </div>
              <h3 className="text-2xl font-black mb-1">{stat.value}</h3>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Deals Table/List */}
        <div className="glass-card rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="text-xl font-black">All Deals</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input 
                type="text" 
                placeholder="Search deals..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-muted rounded-xl border border-border focus:border-orange-500 outline-none w-64"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/50">
                  <th className="p-4 font-bold text-sm">Product</th>
                  <th className="p-4 font-bold text-sm">Category</th>
                  <th className="p-4 font-bold text-sm">Discount</th>
                  <th className="p-4 font-bold text-sm">Status</th>
                  <th className="p-4 font-bold text-sm">Clicks</th>
                  <th className="p-4 font-bold text-sm text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {deals.filter(d => d.title.toLowerCase().includes(searchTerm.toLowerCase())).map((deal) => (
                  <tr key={deal.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                          <Image src={deal.imageUrl} alt="" fill className="object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-sm line-clamp-1">{deal.title}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Star size={10} className={deal.featured ? "text-yellow-500 fill-yellow-500" : "text-gray-300"} />
                            {deal.featured ? "Featured" : "Standard"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm">
                      <span className="px-3 py-1 rounded-full bg-muted border border-border">{deal.category}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-black text-orange-500">{deal.offerPercentage}% OFF</span>
                    </td>
                    <td className="p-4">
                      <div className={`flex items-center gap-1.5 text-xs font-bold uppercase ${
                        deal.status === 'live' ? "text-green-500" : 
                        deal.status === 'upcoming' ? "text-blue-500" : "text-red-500"
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${
                          deal.status === 'live' ? "bg-green-500 animate-pulse" : 
                          deal.status === 'upcoming' ? "bg-blue-500" : "bg-red-500"
                        }`} />
                        {deal.status}
                      </div>
                    </td>
                    <td className="p-4 font-mono font-bold text-sm">
                      {deal.clickCount || 0}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => toggleFeatured(deal.id, deal.featured)}
                          className={`p-2 rounded-lg transition-colors ${deal.featured ? "text-yellow-500 bg-yellow-500/10" : "text-muted-foreground hover:bg-muted"}`}
                        >
                          {deal.featured ? <Star size={18} fill="currentColor" /> : <StarOff size={18} />}
                        </button>
                        <Link href={`/admin/deals/edit/${deal.id}`} className="p-2 rounded-lg hover:bg-blue-500/10 text-blue-500 transition-colors">
                          <Edit2 size={18} />
                        </Link>
                        <button onClick={() => handleDelete(deal.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {deals.length === 0 && !loading && (
              <div className="p-12 text-center text-muted-foreground">
                No deals found. Start by adding a new one!
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
