"use client";

import React, { useEffect, useState } from "react";
import { auth, db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { setPersistence, browserLocalPersistence } from "firebase/auth"; // Import the required functions
import { useRouter } from "next/navigation"; // Import useRouter for redirecting
import styles from "./profile.module.css";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS

export default function Profile() {
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Set persistence to local storage
        await setPersistence(auth, browserLocalPersistence);

        // Fetch user data if authenticated
        const user = auth.currentUser;
        if (user) {
          const docRef = doc(db, "Users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserDetails(docSnap.data());
          } else {
            console.log("No user data found");
            // Handle case where user data is not found
          }
        } else {
          // Redirect to login if not authenticated
          router.push("/login");
        }
      } catch (error) {
        console.error("Error fetching user data:", error.message);
        // Handle error fetching user data
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();

    // Listen for authentication state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push("/login");
      }
    });

    // Cleanup the listener on component unmount
    return () => {
      if (unsubscribe && typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [router]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push("/login");
      console.log("User logged out successfully!");
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className={styles.profileContainer}>
      {userDetails ? (
        <>
          <nav className={`navbar navbar-expand-lg ${styles.navbar}`}>
            <a className="navbar-brand" href="#">
              CardCrafter
            </a>
            <div className="d-flex ms-auto">
              <button className={styles.logoutButton} onClick={handleLogout}>
                Logout
              </button>
            </div>
          </nav>
          <div className={styles.userDetails}>
            <h3 className={styles.welcomeHeading}>
              Welcome {userDetails.firstName} 🙏🙏
            </h3>
            <p>Email: {userDetails.email}</p>
            <p>First Name: {userDetails.firstName}</p>
          </div>
        </>
      ) : (
        <p>No user details available.</p>
      )}
    </div>
  );
}
