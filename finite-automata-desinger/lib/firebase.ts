"use client"

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app"
import { getFirestore, type Firestore } from "firebase/firestore"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAk5QMYIsUBpDXYeG368Tes7URCPVgySpI",
  authDomain: "automata-project-21892.firebaseapp.com",
  projectId: "automata-project-21892",
  storageBucket: "automata-project-21892.firebasestorage.app",
  messagingSenderId: "363460958354",
  appId: "1:363460958354:web:24df70a5188bd7d2972e4b",
  measurementId: "G-L5YHT3B1BF",
}

// Initialize Firebase only on client side
let app: FirebaseApp | null = null
let db: Firestore | null = null

if (typeof window !== "undefined") {
  try {
    // Initialize Firebase app
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()

    // Initialize Firestore
    db = getFirestore(app)

    console.log("Firebase initialized successfully")
  } catch (error) {
    console.error("Firebase initialization error:", error)
    app = null
    db = null
  }
}

export { db, app }
