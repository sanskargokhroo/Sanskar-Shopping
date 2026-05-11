"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { supabase } from "@/lib/supabase";
import { 
  collection, addDoc, serverTimestamp, 
  onSnapshot, query, orderBy, deleteDoc, doc 
} from "firebase/firestore";
import { 
  Plus, Trash2, Upload, Image as ImageIcon, 
  ChevronLeft, Save, ExternalLink 
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import Image from "next/image";
import { Banner } from "@/types";
import ImageCropper from "@/components/ImageCropper";

export default function ManageBanners() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    link: "/shopping",
  });

  useEffect(() => {
    if (!authLoading && !user) router.push("/admin/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "banners"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bannerData = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Banner[];
      setBanners(bannerData);
    });
    return () => unsubscribe();
  }, [user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
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
    const file = new File([croppedBlob], "cropped-banner.jpg", { type: "image/jpeg" });
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
    if (!imageFile) return toast.error("Please select a banner image");
    
    setLoading(true);
    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `banners/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('deal-images')
        .upload(filePath, imageFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('deal-images')
        .getPublicUrl(filePath);

      await addDoc(collection(db, "banners"), {
        ...formData,
        imageUrl: publicUrl,
        createdAt: serverTimestamp(),
      });

      toast.success("Banner added successfully!");
      setFormData({ title: "", subtitle: "", link: "/shopping" });
      setImageFile(null);
      setImagePreview(null);
    } catch (error: any) {
      toast.error("Failed to add banner: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this banner?")) return;
    try {
      await deleteDoc(doc(db, "banners", id));
      toast.success("Banner deleted");
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-5xl mx-auto px-4 pt-8">
        <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-orange-500 mb-6 transition-colors">
          <ChevronLeft size={20} /> Back to Dashboard
        </Link>

        <header className="mb-12">
          <h1 className="text-4xl font-black mb-2">Manage <span className="gradient-text">Banners</span></h1>
          <p className="text-muted-foreground">Add or remove slides for the homepage hero section.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Add New Banner Form */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-3xl p-8 border border-border shadow-sm sticky top-8">
              <h2 className="text-xl font-bold mb-6">Add New Slide</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold mb-2">Banner Image</label>
                  <div 
                    className={`relative aspect-[16/4] rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:bg-muted/50 transition-colors ${imagePreview ? 'border-orange-500' : ''}`}
                    onClick={() => document.getElementById('banner-input')?.click()}
                  >
                    {imagePreview ? (
                      <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                    ) : (
                      <>
                        <ImageIcon size={32} className="text-muted-foreground mb-2" />
                        <p className="text-xs text-muted-foreground text-center px-4 font-medium">Click to upload 16:4 image</p>
                      </>
                    )}
                  </div>
                  <input id="banner-input" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Shop Smarter, Save Bigger"
                    className="w-full px-4 py-3 rounded-xl bg-muted border border-border outline-none text-sm"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">Subtitle</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Discover handpicked deals..."
                    className="w-full px-4 py-3 rounded-xl bg-muted border border-border outline-none text-sm"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">Redirect URL</label>
                  <input
                    type="text"
                    required
                    placeholder="/shopping or external link"
                    className="w-full px-4 py-3 rounded-xl bg-muted border border-border outline-none text-sm"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  />
                </div>

                <button
                  disabled={loading}
                  type="submit"
                  className="w-full btn-primary py-4 rounded-xl flex items-center justify-center gap-2 font-bold"
                >
                  {loading ? "Adding..." : <><Plus size={20} /> Add Slide</>}
                </button>
              </form>
            </div>
          </div>

          {/* Current Banners List */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold mb-6">Current Slides ({banners.length})</h2>
            <div className="space-y-4">
              {banners.map((banner) => (
                <div key={banner.id} className="glass-card p-4 rounded-3xl flex flex-col md:flex-row gap-6 items-center">
                  <div className="relative w-full md:w-48 aspect-[16/4] rounded-2xl overflow-hidden flex-shrink-0">
                    <Image src={banner.imageUrl} alt="" fill className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{banner.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">{banner.subtitle}</p>
                    <div className="flex items-center gap-4 mt-4">
                      <span className="text-xs bg-muted px-3 py-1 rounded-full border border-border font-mono">{banner.link}</span>
                      <button 
                        onClick={() => handleDelete(banner.id)}
                        className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-colors ml-auto"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {banners.length === 0 && (
                <div className="text-center py-20 glass-card rounded-[3rem]">
                  <p className="text-muted-foreground">No slides yet. The default banner will be shown.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {showCropper && tempImageSrc && (
        <ImageCropper
          imageSrc={tempImageSrc}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspect={16 / 4}
        />
      )}
    </div>
  );
}
