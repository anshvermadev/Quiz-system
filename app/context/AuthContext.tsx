'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '../types';
import { auth, googleProvider, db } from '../lib/firebase';
import { onAuthStateChanged, signInWithPopup, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthContextType {
    currentUser: User | null;
    login: () => Promise<void>;
    logout: () => Promise<void>;
    showAuthModal: boolean;
    setShowAuthModal: (show: boolean) => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
            if (firebaseUser) {
                const userRef = doc(db, 'users', firebaseUser.uid);
                const userSnap = await getDoc(userRef);

                let userData = {
                    uid: firebaseUser.uid,
                    name: firebaseUser.displayName || 'Anonymous',
                    email: firebaseUser.email || '',
                    isAdmin: false
                };

                if (userSnap.exists()) {
                    userData = { ...userData, ...userSnap.data() } as any;
                } else {
                    // Create new user doc
                    await setDoc(userRef, userData);
                }

                setCurrentUser(userData);
            } else {
                setCurrentUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
            setShowAuthModal(false);
        } catch (error) {
            console.error("Error signing in with Google", error);
            alert("Failed to sign in. Please try again.");
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            setCurrentUser(null);
        } catch (error) {
            console.error("Error signing out", error);
        }
    };

    return (
        <AuthContext.Provider value={{ currentUser, login, logout, showAuthModal, setShowAuthModal, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
