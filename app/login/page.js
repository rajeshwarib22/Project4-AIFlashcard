"use client"; // Ensure the component is treated as a Client Component

import React, { useState } from "react"; // Import useState from React
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth, db } from "@/firebase";
import { setDoc, doc } from "firebase/firestore";
import { toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";
import styles from "./login.module.css"; // Import the updated CSS module

export default function AuthPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("User logged in successfully");
      window.location.href = "/profile";
      toast.success("User logged in successfully", {
        position: "top-center",
      });
    } catch (error) {
      console.error(error.message);
      toast.error(error.message, {
        position: "bottom-center",
      });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      const user = auth.currentUser;
      if (user) {
        await setDoc(doc(db, "Users", user.uid), {
          email: user.email,
          firstName: fname,
          lastName: lname,
          photo: "",
        });
      }
      console.log("User registered successfully");
      toast.success("User registered successfully", {
        position: "top-center",
      });
      window.location.href = "/profile";
    } catch (error) {
      console.error(error.message);
      toast.error(error.message, {
        position: "bottom-center",
      });
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>CardCrafter</h1>
      </header>
      <main className={styles.main}>
        <section className={styles.heroSection}>
          {" "}
          <h2>Enhance Your Learning with Flashcards</h2>
          <p>
            Practice and master your subjects with custom flashcards. Sign in to
            get started!
          </p>
          <h3 className={styles.h3}>{isRegistering ? "Sign Up" : "Login"}</h3>
          <div className={styles.formContainer}>
            <form onSubmit={isRegistering ? handleRegister : handleLogin}>
              {isRegistering && (
                <>
                  <div className={`mb-3 ${styles.mb3}`}>
                    <label className={`form-label ${styles.label}`}>
                      First name
                    </label>
                    <input
                      type="text"
                      className={`form-control ${styles.formControl}`}
                      placeholder="First name"
                      value={fname}
                      onChange={(e) => setFname(e.target.value)}
                      required
                    />
                  </div>
                  <div className={`mb-3 ${styles.mb3}`}>
                    <label className={`form-label ${styles.label}`}>
                      Last name
                    </label>
                    <input
                      type="text"
                      className={`form-control ${styles.formControl}`}
                      placeholder="Last name"
                      value={lname}
                      onChange={(e) => setLname(e.target.value)}
                    />
                  </div>
                </>
              )}
              <div className={`mb-3 ${styles.mb3}`}>
                <label className={`form-label ${styles.label}`}>
                  Email address
                </label>
                <input
                  type="email"
                  className={`form-control ${styles.formControl}`}
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className={`mb-3 ${styles.mb3}`}>
                <label className={`form-label ${styles.label}`}>Password</label>
                <input
                  type="password"
                  className={`form-control ${styles.formControl}`}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className={styles.dGrid}>
                <button
                  type="submit"
                  className={`btn btn-primary ${styles.btnPrimary}`}
                >
                  {isRegistering ? "Sign Up" : "Login"}
                </button>
              </div>
              <p className={styles.textCenter}>
                {isRegistering ? (
                  <span>
                    Already registered?{" "}
                    <a
                      href="#"
                      className={`btn btn-link ${styles.link}`}
                      onClick={() => setIsRegistering(false)}
                    >
                      Login
                    </a>
                  </span>
                ) : (
                  <span>
                    New user?{" "}
                    <a
                      href="#"
                      className={`btn btn-link ${styles.link}`}
                      onClick={() => setIsRegistering(true)}
                    >
                      Register
                    </a>
                  </span>
                )}
              </p>
            </form>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <p>&copy; 2024 FlashCard Master. All rights reserved.</p>
      </footer>
    </div>
  );
}
