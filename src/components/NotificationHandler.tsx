"use client";

import { useEffect } from "react";
import { messaging, db } from "@/lib/firebase";
import { getToken, onMessage } from "firebase/messaging";
import { collection, addDoc, query, where, getDocs, onSnapshot } from "firebase/firestore";
import toast from "react-hot-toast";

export default function NotificationHandler() {
  useEffect(() => {
    let unsubscribeDeals: (() => void) | undefined;

    const setupNotifications = async () => {
      try {
        if (typeof window === "undefined" || !("Notification" in window)) return;

        const permission = await Notification.requestPermission();
        if (permission === "granted" && messaging) {
          const vapidKey = "BEw7Boikrjz_vFG53qyKeL_RGYVgNcBF68ADbXd7lVMp-FLTf-RoBw_YVT-XyTJ1RKDhcGtfYUWh68ki9waunYQ".trim();
          
          const token = await getToken(messaging, { vapidKey }).catch(err => {
            console.error("Token generation failed:", err);
            return null;
          });

          if (token) {
            console.log("FCM Token:", token);
            const q = query(collection(db, "fcm_tokens"), where("token", "==", token));
            const querySnapshot = await getDocs(q);
            
            if (querySnapshot.empty) {
              await addDoc(collection(db, "fcm_tokens"), {
                token,
                createdAt: new Date(),
                platform: "web"
              });
            }
          }
        }

        if (messaging) {
          onMessage(messaging, (payload) => {
            showToast(payload.notification?.title, payload.notification?.body);
          });
        }

        const dealsQuery = query(collection(db, "deals"), where("status", "==", "live"));
        let initialLoad = true;
        
        unsubscribeDeals = onSnapshot(dealsQuery, (snapshot) => {
          if (initialLoad) {
            initialLoad = false;
            return;
          }
          
          snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
              const newDeal = change.doc.data();
              showToast("New Deal Added! 🔥", newDeal.title);
            }
          });
        });
      } catch (error) {
        console.error("Error setting up notifications:", error);
      }
    };

    const showToast = (title?: string, body?: string) => {
      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-[#0a0a0a] shadow-[0_0_50px_rgba(249,115,22,0.15)] rounded-[2.5rem] pointer-events-auto flex ring-1 ring-orange-500/30 border border-orange-500/20 p-5 backdrop-blur-xl`}>
          <div className="flex-1 w-0 p-1">
            <div className="flex items-start">
              <div className="ml-3 flex-1">
                <p className="text-xs font-black text-orange-500 uppercase tracking-[0.2em] mb-2">New Update 🚀</p>
                <p className="text-lg font-black text-white leading-tight">{title}</p>
                <p className="mt-1 text-sm font-medium text-gray-400 line-clamp-2">{body}</p>
              </div>
            </div>
          </div>
        </div>
      ), { duration: 6000 });
    };

    setupNotifications();

    return () => {
      if (unsubscribeDeals) unsubscribeDeals();
    };
  }, []);

  return null;
}
