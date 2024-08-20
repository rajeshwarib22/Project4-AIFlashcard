"use client"; // Ensure this is at the top of the file

import React, { useEffect, useState } from "react";
import ReactCardFlip from "react-card-flip";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  orderBy,
  getDoc,
  doc,
} from "firebase/firestore";
import { auth, db } from "@/firebase";
import { useRouter } from "next/navigation";
import styles from "./profile.module.css";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Profile() {
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [flashcards, setFlashcards] = useState([]);
  const [newCard, setNewCard] = useState({
    question: "",
    answer: "",
    category: "",
  });
  const [selectedCategory, setSelectedCategory] = useState("");
  const [flipped, setFlipped] = useState({}); // Track flipped state of cards
  const [editingCard, setEditingCard] = useState(null); // Track card being edited
  const router = useRouter();

  const fetchUserFlashcards = async (userId) => {
    try {
      console.log("Fetching flashcards for userId:", userId);

      // Ensure userId is valid
      if (!userId) {
        console.error("User ID is missing");
        return;
      }

      const flashcardsRef = collection(db, "flashcards");

      // Create a query to get documents where the userId matches
      const q = query(
        flashcardsRef,
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);

      console.log("Query snapshot:", querySnapshot);

      // Check if documents exist
      if (querySnapshot.empty) {
        console.log("No flashcards found");
        setFlashcards([]);
        return;
      }

      // Map the documents to include id and data
      const userFlashcards = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log("Fetched flashcards:", userFlashcards);
      setFlashcards(userFlashcards);
    } catch (error) {
      console.error("Error fetching flashcards:", error.message);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const docRef = doc(db, "Users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserDetails(docSnap.data());
            fetchUserFlashcards(user.uid); // Fetch flashcards here
          } else {
            console.log("No user data found");
            router.push("/login");
          }
        } else {
          console.log("User is not authenticated");
          router.push("/login");
        }
      } catch (error) {
        console.error("Error fetching user data:", error.message);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error.message);
    }
  };

  const handleAddCard = async (e) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      if (user) {
        if (editingCard) {
          // Update existing card
          const cardRef = doc(db, "flashcards", editingCard.id);
          await updateDoc(cardRef, {
            question: newCard.question,
            answer: newCard.answer,
            category: newCard.category,
          });
          setEditingCard(null); // Reset editing state
        } else {
          // Add new card
          await addDoc(collection(db, "flashcards"), {
            userId: user.uid,
            question: newCard.question,
            answer: newCard.answer,
            category: newCard.category,
            createdAt: new Date(),
          });
        }
        setNewCard({ question: "", answer: "", category: "" });
        setSelectedCategory(newCard.category); // Set selected category
        fetchUserFlashcards(user.uid); // Refresh flashcards
      } else {
        console.log("User not authenticated");
        router.push("/login");
      }
    } catch (error) {
      console.error(
        editingCard ? "Error updating flashcard:" : "Error adding flashcard:",
        error.message
      );
    }
  };

  const handleEditCard = (card) => {
    setNewCard({
      question: card.question,
      answer: card.answer,
      category: card.category,
    });
    setEditingCard(card);
  };

  const handleDeleteCard = async (id) => {
    try {
      await deleteDoc(doc(db, "flashcards", id));
      fetchUserFlashcards(auth.currentUser.uid); // Refresh flashcards
    } catch (error) {
      console.error("Error deleting flashcard:", error.message);
    }
  };

  const handleCardFlip = (id) => {
    setFlipped((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className={styles.profilecontainer}>
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
      <main className={styles.main}>
        {loading ? (
          <p>Loading...</p>
        ) : userDetails ? (
          <>
            <div className={styles.userDetails}>
              <h2>Welcome, {userDetails.firstName}!</h2>
              <h3>Create your own flashcards!!</h3>

              <form onSubmit={handleAddCard}>
                <div className={`mb-3 ${styles.mb3}`}>
                  <label className={`form-label ${styles.label}`}>
                    Question
                  </label>
                  <input
                    type="text"
                    className={`form-control ${styles.formControl}`}
                    value={newCard.question}
                    onChange={(e) =>
                      setNewCard({ ...newCard, question: e.target.value })
                    }
                    required
                  />
                </div>
                <div className={`mb-3 ${styles.mb3}`}>
                  <label className={`form-label ${styles.label}`}>Answer</label>
                  <input
                    type="text"
                    className={`form-control ${styles.formControl}`}
                    value={newCard.answer}
                    onChange={(e) =>
                      setNewCard({ ...newCard, answer: e.target.value })
                    }
                    required
                  />
                </div>
                <div className={`mb-3 ${styles.mb3}`}>
                  <label className={`form-label ${styles.label}`}>
                    Category
                  </label>
                  <select
                    className={`form-control ${styles.formControl}`}
                    value={newCard.category}
                    onChange={(e) =>
                      setNewCard({ ...newCard, category: e.target.value })
                    }
                    required
                  >
                    <option value="">Select a category</option>
                    <option value="Math">Math</option>
                    <option value="Science">Science</option>
                    <option value="History">History</option>
                    {/* Add more categories as needed */}
                  </select>
                </div>
                <button
                  type="submit"
                  className={`btn btn-primary ${styles.btnPrimary}`}
                >
                  {editingCard ? "Update Flashcard" : "Add Flashcard"}
                </button>
              </form>

              <h3>Your Flashcards</h3>
              <div className={styles.flashcardsContainer}>
                {flashcards.length ? (
                  flashcards
                    .filter(
                      (card) =>
                        card.category === selectedCategory ||
                        selectedCategory === ""
                    )
                    .map((card) => (
                      <div key={card.id} className={styles.cardWrapper}>
                        <ReactCardFlip
                          isFlipped={!!flipped[card.id]}
                          flipDirection="horizontal"
                        >
                          <div
                            className={styles.cardFront}
                            onClick={() => handleCardFlip(card.id)}
                          >
                            <div className={styles.question}>
                              <strong>Question:</strong> {card.question}
                              <br></br>
                              <strong>Category:</strong> {card.category}
                            </div>
                            <div className={styles.category}></div>
                          </div>
                          <div
                            className={styles.cardBack}
                            onClick={() => handleCardFlip(card.id)}
                          >
                            <strong>Answer:</strong> &nbsp;&nbsp;&nbsp;
                            {card.answer}
                          </div>
                        </ReactCardFlip>
                        <div className={styles.cardActions}>
                          <button
                            className="btn btn-secondary"
                            onClick={() => handleEditCard(card)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-danger"
                            onClick={() => handleDeleteCard(card.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                ) : (
                  <p>No flashcards available</p>
                )}
              </div>
            </div>
          </>
        ) : (
          <p>User details not found</p>
        )}
      </main>
    </div>
  );
}
