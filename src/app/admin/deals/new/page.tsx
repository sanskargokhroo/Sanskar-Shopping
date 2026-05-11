"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { supabase } from "@/lib/supabase";
import { collection, addDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { 
  ChevronLeft, Upload, Image as ImageIcon, 
  Tag, Percent, Link as LinkIcon, 
  Calendar, Layers, Save, X, ShoppingBag, TrendingUp 
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import Image from "next/image";
import ImageCropper from "@/components/ImageCropper";

const CATEGORIES = ["Electronics", "Fashion", "Home", "Beauty", "Food & Groceries", "Services", "Earn Money", "Other"];
const PLATFORMS = ["Amazon", "Flipkart", "Shopsy", "Myntra", "Shein", "Other"];

export default function AddDeal() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    redirectUrl: "",
    offerPercentage: "",
    category: "Electronics",
    status: "live",
    description: "",
    expiryDate: "",
    featured: false,
    platform: "Amazon",
    price: "",
    originalPrice: "",
    dealType: "shopping",
  });

  useEffect(() => {
    if (!authLoading && !user) router.push("/admin/login");
  }, [user, authLoading, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempImageSrc(reader.result as string);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    const file = new File([croppedBlob], "cropped-image.jpg", { type: "image/jpeg" });
    setImageFile(file);
    setImagePreview(URL.createObjectURL(croppedBlob));
    setShowCropper(false);
    setTempImageSrc(null);
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setTempImageSrc(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) return toast.error("Please upload a product image");
    
    setLoading(true);
    try {
      // 1. Upload Image to Supabase
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

      const imageUrl = publicUrl;

      // 2. Prepare Expiry Date
      let expiresAt: Date;
      if (formData.expiryDate) {
        expiresAt = new Date(formData.expiryDate);
      } else {
        // Default to 7 days from now
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
      }

      const isEarn = formData.dealType === 'earn';

      // 3. Save to Firestore
      await addDoc(collection(db, "deals"), {
        title: formData.title,
        redirectUrl: formData.redirectUrl,
        imageUrl,
        offerPercentage: isEarn ? 0 : Number(formData.offerPercentage),
        category: isEarn ? "Earn Money" : formData.category,
        status: formData.status,
        description: formData.description,
        createdAt: serverTimestamp(),
        expiresAt: Timestamp.fromDate(expiresAt),
        featured: formData.featured,
        clickCount: 0,
        platform: isEarn ? "Other" : formData.platform,
        price: isEarn ? 0 : Number(formData.price),
        originalPrice: isEarn ? 0 : Number(formData.originalPrice),
        dealType: formData.dealType,
      });

      toast.success("Deal added successfully!");
      router.push("/admin/dashboard");
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to add deal: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-4xl mx-auto px-4 pt-8">
        <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-orange-500 mb-6 transition-colors">
          <ChevronLeft size={20} /> Back to Dashboard
        </Link>

        <header className="mb-8">
          <h1 className="text-4xl font-black mb-2">Add New <span className="gradient-text">Deal</span></h1>
          <p className="text-muted-foreground">Fill in the details below to publish a new offer.</p>
        </header>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Form Details */}
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
                    placeholder="iPhone 15 Pro Max - 256GB Titanium"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-muted border border-border focus:border-orange-500 outline-none"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 ml-1">Redirect URL (Affiliate/Original Link)</label>
                <div className="relative">
                  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                  <input
                    type="url"
                    required
                    placeholder="https://amazon.in/dp/..."
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
                      <label className="block text-sm font-bold mb-2 ml-1">Offer Percentage (%)</label>
                      <div className="relative">
                        <Percent className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                        <input
                          type="number"
                          required
                          placeholder="40"
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
                <label className="block text-sm font-bold mb-2 ml-1">Description (Optional)</label>
                <textarea
                  placeholder="Tell something about this deal..."
                  className="w-full p-4 rounded-2xl bg-muted border border-border focus:border-orange-500 outline-none h-32 resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                ></textarea>
              </div>
            </div>
          </div>

          {/* Right Column: Image & Status */}
          <div className="space-y-6">
            {/* Image Upload */}
            <div className="glass-card p-6 rounded-[2.5rem]">
              <label className="block text-sm font-bold mb-4">Product Image</label>
              <div 
                className={`relative aspect-square rounded-3xl border-2 border-dashed border-border flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:bg-muted/50 transition-colors ${imagePreview ? 'border-orange-500' : ''}`}
                onClick={() => document.getElementById('image-input')?.click()}
              >
                {imagePreview ? (
                  <>
                    <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <p className="text-white font-bold flex items-center gap-2">
                        <Upload size={20} /> Change Image
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <ImageIcon size={48} className="text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground font-medium text-center px-4">
                      Drag & drop or <span className="text-orange-500">click to upload</span>
                    </p>
                  </>
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

            {/* Status & Expiry */}
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
                <label className="block text-sm font-bold mb-2">Expiry Date (Optional)</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <input
                    type="date"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted border border-border outline-none text-sm"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-2 px-1">
                  * Defaults to 7 days if left empty.
                </p>
              </div>

              <label className="flex items-center gap-3 cursor-pointer p-4 rounded-2xl bg-muted/50 border border-border hover:bg-muted transition-colors">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 accent-orange-500" 
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                />
                <div>
                  <p className="font-bold text-sm leading-none">Featured Deal</p>
                  <p className="text-[10px] text-muted-foreground">Show on homepage spotlight</p>
                </div>
              </label>

              <button
                disabled={loading}
                type="submit"
                className="w-full btn-primary flex items-center justify-center gap-2 py-4"
              >
                {loading ? "Publishing..." : "Publish Deal"}
                {!loading && <Save size={20} />}
              </button>
            </div>
          </div>
        </form>
      </div>

      {showCropper && tempImageSrc && (
        <ImageCropper
          imageSrc={tempImageSrc}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspect={4 / 5}
        />
      )}
    </div>
  );
}
