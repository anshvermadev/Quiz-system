'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Quiz, QuizSubmission } from '../types';
import { db } from '../lib/firebase';
import {
    collection,
    onSnapshot,
    doc,
    runTransaction,
    query,
    orderBy,
    setDoc,
    getDoc
} from 'firebase/firestore';

interface QuizContextType {
    quizzes: Quiz[];
    submitQuiz: (quizId: string, answers: Record<string, number>, finalScore: number, totalQuestions: number, user: any, timeTaken: number, startedAt: string) => Promise<void>;
    updateQuizProgress: (quizId: string, userId: string, data: Partial<QuizSubmission>) => Promise<void>;
    getQuiz: (id: string) => Quiz | undefined;
    checkSubmission: (quizId: string, userId: string) => Promise<QuizSubmission | null>;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export function QuizProvider({ children }: { children: ReactNode }) {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);

    useEffect(() => {
        const q = query(collection(db, 'quizzes'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const quizzesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Quiz[];
            setQuizzes(quizzesData);
        }, (error) => {
            console.error("Error fetching quizzes: ", error);
        });

        return () => unsubscribe();
    }, []);

    const updateQuizProgress = async (quizId: string, userId: string, data: Partial<QuizSubmission>) => {
        if (!userId || !quizId) return;
        const submissionRef = doc(db, 'quizzes', quizId, 'submissions', userId);
        try {
            await setDoc(submissionRef, data, { merge: true });
        } catch (e) {
            console.error("Progress update failed: ", e);
        }
    };

    const submitQuiz = async (quizId: string, answers: Record<string, number>, finalScore: number, totalQuestions: number, user: any, timeTaken: number, startedAt: string) => {
        if (!user || !user.uid) return;

        const submissionRef = doc(db, 'quizzes', quizId, 'submissions', user.uid);

        try {
            const submissionData: QuizSubmission = {
                userId: user.uid,
                userName: user.name || user.displayName || 'Anonymous',
                userEmail: user.email || 'No Email',
                timeTaken: timeTaken,
                startedAt: startedAt,
                quizId: quizId,
                answers,
                score: finalScore,
                totalQuestions,
                completedAt: new Date().toISOString(),
                status: 'completed',
                lastQuestionIndex: totalQuestions - 1
            };

            await setDoc(submissionRef, submissionData);
        } catch (e) {
            console.error("Submission failed: ", e);
            throw e;
        }
    };

    const checkSubmission = async (quizId: string, userId: string): Promise<QuizSubmission | null> => {
        if (!userId || !quizId) return null;
        try {
            const docRef = doc(db, 'quizzes', quizId, 'submissions', userId);
            const snapshot = await getDoc(docRef);
            if (snapshot.exists()) {
                return snapshot.data() as QuizSubmission;
            }
            return null;
        } catch (error) {
            console.error("Error checking submission:", error);
            return null;
        }
    };

    const getQuiz = (id: string) => quizzes.find(p => p.id === id);

    return (
        <QuizContext.Provider value={{ quizzes, submitQuiz, getQuiz, checkSubmission, updateQuizProgress }}>
            {children}
        </QuizContext.Provider>
    );
}

export function useQuizzes() {
    const context = useContext(QuizContext);
    if (context === undefined) {
        throw new Error('useQuizzes must be used within a QuizProvider');
    }
    return context;
}
