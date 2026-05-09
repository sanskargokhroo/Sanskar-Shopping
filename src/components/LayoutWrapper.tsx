"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Footer from "./Footer";
import NotificationHandler from "./NotificationHandler";
import VisitorTracker from "./VisitorTracker";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <>
      <NotificationHandler />
      <VisitorTracker />
      {children}
      {!isAdmin && <Footer />}
    </>
  );
}
