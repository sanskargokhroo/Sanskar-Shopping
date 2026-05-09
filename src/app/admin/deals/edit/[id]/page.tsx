"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { supabase } from "@/lib/supabase";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { 
  ChevronLeft, Upload, Image as ImageIcon, 
  Tag, Percent, Link as LinkIcon, 
  Calendar, Layers, Save, X, ShoppingBag, TrendingUp 
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import Image from "next/image";

const CATEGORIES = ["Electronics", "Fashion", "Home", "Beauty", "Food & Groceries", "Services", "Earn Money", "Other"];
const PLATFORMS = ["Amazon", "Flipkart", "Shopsy", "Myntra", "Shein", "Other"];

export default function EditDeal() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    redirectUrl: "",
    offerPercentage: "",
    category: "Electronics",
    status: "live",
    description: "",
    expiryDate: "",
    featured: false,
    imageUrl: "",
    platform: "Amazon",
    price: "",
    originalPrice: "",
    dealType: "shopping",
  });

  useEffect(() => {
    if (!authLoading && !user) router.push("/admin/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchDeal = async () => {
      if (!id || !user) return;
      try {
        const docRef = doc(db, "deals", id as string);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const expDate = data.expiresAt ? (data.expiresAt as any).toDate().toISOString().split('T')[0] : "";
          
          setFormData({
            title: data.title,
            redirectUrl: data.redirectUrl,
            offerPercentage: data.offerPercentage.toString(),
            category: data.category,
            status: data.status,
            description: data.description || "",
            expiryDate: expDate,
            featured: data.featured || false,
            imageUrl: data.imageUrl,
            platform: data.platform || "Amazon",
            price: data.price ? data.price.toString() : "",
            originalPrice: data.originalPrice ? data.originalPrice.toString() : "",
            dealType: data.dealType || "shopping",
          });
          setImagePreview(data.imageUrl);
        } else {
          toast.error("Deal not found");
          router.push("/admin/dashboard");
        }
      } catch (error) {
        console.error(error);
        toast.error("Error fetching deal");
      } finally {
        setFetching(false);
      }
    };

    fetchDeal();
  }, [id, user, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let finalImageUrl = formData.imageUrl;

      // 1. Upload new image to Supabase if selected
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('deal-images')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('deal-images')
          .getPublicUrl(filePath);

        finalImageUrl = publicUrl;
      }

      // 2. Prepare Expiry Date
      let expiresAt: Date;
      if (formData.expiryDate) {
        expiresAt = new Date(formData.expiryDate);
      } else {
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
      }

      // 3. Update Firestore
      const isEarn = formData.dealType === 'earn';

      await updateDoc(doc(db, "deals", id as string), {
        title: formData.title,
        redirectUrl: formData.redirectUrl,
        imageUrl: finalImageUrl,
        offerPercentage: isEarn ? 0 : Number(formData.offerPercentage),
        category: isEarn ? "Earn Money" : formData.category,
        status: formData.status,
        description: formData.description,
        expiresAt: Timestamp.fromDate(expiresAt),
        featured: formData.featured,
        platform: isEarn ? "Other" : formData.platform,
        price: isEarn ? 0 : Number(formData.price),
        originalPrice: isEarn ? 0 : Number(formData.originalPrice),
        dealType: formData.dealType,
      });

      toast.success("Deal updated successfully!");
      router.push("/admin/dashboard");
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to update deal: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || fetching) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-4xl mx-auto px-4 pt-8">
        <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-orange-500 mb-6 transition-colors">
          <ChevronLeft size={20} /> Back to Dashboard
        </Link>

        <header className="mb-8">
          <h1 className="text-4xl font-black mb-2">Edit <span className="gradient-text">Deal</span></h1>
          <p className="text-muted-foreground">Modify the details of this offer.</p>
        </header>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-3xl p-8 border border-border shadow-sm space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, dealType: 'shopping' })}
                  className={`py-4 rounded-2xl font-bold flex flex-col items-center gap-2 border transition-all ${
                    formData.dealType === 'shopping' 
                    ? 'bg-orange-500 text-white border-orange-500 shadow-lg' 
                    : 'bg-muted text-muted-foreground border-border hover:border-orange-500/50'
                  }`}
                >
                  <ShoppingBag size={24} />
                  Shopping Deal
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, dealType: 'earn' })}
                  className={`py-4 rounded-2xl font-bold flex flex-col items-center gap-2 border transition-all ${
                    formData.dealType === 'earn' 
                    ? 'bg-green-500 text-white border-green-500 shadow-lg' 
                    : 'bg-muted text-muted-foreground border-border hover:border-green-500/50'
                  }`}
                >
                  <TrendingUp size={24} />
                  Earn Money Deal
                </button>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 ml-1">Deal Title</label>
                <div className="relative">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                  <input
                    type="text"
                    required
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-muted border border-border focus:border-orange-500 outline-none"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 ml-1">Redirect URL</label>
                <div className="relative">
                  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                  <input
                    type="url"
                    required
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-muted border border-border focus:border-orange-500 outline-none"
                    value={formData.redirectUrl}
                    onChange={(e) => setFormData({ ...formData, redirectUrl: e.target.value })}
                  />
                </div>
              </div>

              {formData.dealType === 'shopping' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold mb-2 ml-1">Original Price (₹)</label>
                      <div className="relative">
                        <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                        <input
                          type="number"
                          required
                          placeholder="1000"
                          className="w-full pl-12 pr-4 py-4 rounded-2xl bg-muted border border-border focus:border-orange-500 outline-none"
                          value={formData.originalPrice}
                          onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold mb-2 ml-1">Deal Price (₹)</label>
                      <div className="relative">
                        <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                        <input
                          type="number"
                          required
                          placeholder="600"
                          className="w-full pl-12 pr-4 py-4 rounded-2xl bg-muted border border-border focus:border-orange-500 outline-none"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold mb-2 ml-1">Offer %</label>
                      <div className="relative">
                        <Percent className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                        <input
                          type="number"
                          required
                          className="w-full pl-12 pr-4 py-4 rounded-2xl bg-muted border border-border focus:border-orange-500 outline-none"
                          value={formData.offerPercentage}
                          onChange={(e) => setFormData({ ...formData, offerPercentage: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold mb-2 ml-1">Category</label>
                      <div className="relative">
                        <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                        <select
                          className="w-full pl-12 pr-4 py-4 rounded-2xl bg-muted border border-border focus:border-orange-500 outline-none appearance-none"
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        >
                          {CATEGORIES.map(c => <option key={c} value={c} className="text-black">{c}</option>)}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold mb-2 ml-1">Platform</label>
                      <div className="relative">
                        <ShoppingBag className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                        <select
                          className="w-full pl-12 pr-4 py-4 rounded-2xl bg-muted border border-border focus:border-orange-500 outline-none appearance-none"
                          value={formData.platform}
                          onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                        >
                          {PLATFORMS.map(p => <option key={p} value={p} className="text-black">{p}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-bold mb-2 ml-1">Description</label>
                <textarea
                  className="w-full p-4 rounded-2xl bg-muted border border-border focus:border-orange-500 outline-none h-32 resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                ></textarea>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-card p-6 rounded-[2.5rem]">
              <label className="block text-sm font-bold mb-4">Product Image</label>
              <div 
                className="relative aspect-square rounded-3xl border-2 border-dashed border-border flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => document.getElementById('image-input')?.click()}
              >
                {imagePreview ? (
                  <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                ) : (
                  <ImageIcon size={48} className="text-muted-foreground" />
                )}
              </div>
              <input 
                id="image-input" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageChange} 
              />
            </div>

            <div className="glass-card p-6 rounded-[2.5rem] space-y-6">
              <div>
                <label className="block text-sm font-bold mb-2">Deal Status</label>
                <div className="flex gap-2">
                  {['live', 'upcoming', 'ended'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFormData({ ...formData, status: s })}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                        formData.status === s 
                        ? 'bg-orange-500 text-white' 
                        : 'bg-muted text-muted-foreground border border-border'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Expiry Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <input
                    type="date"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted border border-border outline-none text-sm"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer p-4 rounded-2xl bg-muted/50 border border-border">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 accent-orange-500" 
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                />
                <span className="font-bold text-sm">Featured Deal</span>
              </label>

              <button
                disabled={loading}
                type="submit"
                className="w-full btn-primary flex items-center justify-center gap-2 py-4"
              >
                {loading ? "Saving Changes..." : "Save Changes"}
                {!loading && <Save size={20} />}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
