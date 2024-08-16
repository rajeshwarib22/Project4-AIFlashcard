"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/firebase"; // Import your Firebase configuration

export default function HomePage() {
  const router = useRouter(); // Initialize Next.js router

  useEffect(() => {
    const checkAuth = () => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        if (!user) {
          // Redirect to the login page if the user is not authenticated
          router.push("/login");
        }
      });

      // Clean up the subscription on unmount
      return () => unsubscribe();
    };

    checkAuth();
  }, [router]);

  return null; // No need to render anything on this page
}
