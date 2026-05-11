"use client";

import { useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, query, where, getDocs, serverTimestamp, doc, updateDoc } from "firebase/firestore";

export default function VisitorTracker() {
  useEffect(() => {
    const trackVisitor = async () => {
      try {
        // Check if visitor is already tracked in this session
        const isTracked = sessionStorage.getItem("visitor_tracked");
        if (isTracked) return;

        // Simple unique ID for the visitor (stored in localStorage)
        let visitorId = localStorage.getItem("visitor_id");
        if (!visitorId) {
          visitorId = Math.random().toString(36).substring(2, 15);
          localStorage.setItem("visitor_id", visitorId);
        }

        // Add to visitors collection if not already there for today
        // Or just count total unique visitors
        const q = query(collection(db, "visitors"), where("visitorId", "==", visitorId));
        const querySnapshot = await getDocs(q);

        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone || document.referrer.includes('android-app://');

        if (querySnapshot.empty) {
          await addDoc(collection(db, "visitors"), {
            visitorId,
            timestamp: serverTimestamp(),
            userAgent: navigator.userAgent,
            isApp: isStandalone,
            platform: isStandalone ? "app" : "web"
          });
        } else {
          if (isStandalone) {
            querySnapshot.forEach(async (docSnap) => {
              const data = docSnap.data();
              if (data.platform !== 'app') {
                await updateDoc(doc(db, "visitors", docSnap.id), {
                  isApp: true,
                  platform: "app"
                });
              }
            });
          }
        }

        sessionStorage.setItem("visitor_tracked", "true");
      } catch (error) {
        console.error("Visitor tracking failed:", error);
      }
    };

    trackVisitor();
  }, []);

  return null;
}
