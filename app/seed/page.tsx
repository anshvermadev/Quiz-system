'use client';

import React, { useState } from 'react';
import { initialQuizzes } from '../data/quizzes';
import { db } from '../lib/firebase';
import { collection, doc, setDoc, getDocs } from 'firebase/firestore';

export default function SeedPage() {
    const [status, setStatus] = useState('Idle');

    const seedData = async () => {
        try {
            setStatus('Checking existing data...');
            const quizzesRef = collection(db, 'quizzes');
            const snapshot = await getDocs(quizzesRef);

            if (!snapshot.empty) {
                setStatus('Data already exists. Skipping seed.');
                return;
            }

            setStatus('Seeding data...');
            for (const quiz of initialQuizzes) {
                await setDoc(doc(db, 'quizzes', quiz.id), quiz);
            }
            setStatus('Seeding complete!');
        } catch (error) {
            console.error(error);
            setStatus('Error: ' + error);
        }
    };

    const clearData = async () => {
        try {
            setStatus('Clearing functionality disabled for safety in this version. Use Console.');
            // const quizzesRef = collection(db, 'quizzes');
            // ...
        } catch (error) {
            setStatus('Error: ' + error);
        }
    };

    return (
        <div className="p-10 font-sans">
            <h1 className="text-3xl font-bold mb-4">Quiz Database Seeder</h1>
            <p className="mb-4">Status: {status}</p>
            <div className="flex gap-4">
                <button
                    onClick={seedData}
                    className="bg-green-500 text-white px-4 py-2 rounded"
                >
                    Seed Initial Quizzes
                </button>
            </div>
        </div>
    );
}
