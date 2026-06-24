'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuizzes } from '../../context/QuizContext';
import { useAuth } from '../../context/AuthContext';
import QuizRunner from '../../components/QuizRunner';

export default function QuizPage() {
    const { id } = useParams();
    const router = useRouter();
    const { getQuiz, checkSubmission } = useQuizzes();
    const { currentUser, setShowAuthModal } = useAuth();
    const [submission, setSubmission] = React.useState<any>(null); // Use any or import QuizSubmission
    const [loading, setLoading] = React.useState(true);

    const quiz = getQuiz(id as string);

    React.useEffect(() => {
        async function fetchSubmission() {
            if (currentUser && quiz) {
                const sub = await checkSubmission(quiz.id, currentUser.uid);
                setSubmission(sub);
            }
            setLoading(false);
        }
        if (quiz && currentUser) {
            fetchSubmission();
        } else if (quiz && !currentUser) {
            setLoading(false);
        }
    }, [currentUser, quiz, checkSubmission]);

    if (!quiz) {
        return <div className="p-10 text-center font-bold">Loading User or Quiz not found...</div>;
    }

    if (loading) {
        return <div className="p-10 text-center font-bold">Checking status...</div>;
    }

    if (!currentUser) {
        return (
            <div className="max-w-4xl mx-auto p-10 text-center border-4 border-foreground mt-10 bg-background">
                <h2 className="text-3xl font-black mb-4">LOGIN REQUIRED</h2>
                <p className="mb-6">You must be logged in to take this quiz.</p>
                <button
                    onClick={() => setShowAuthModal(true)}
                    className="border-2 border-foreground px-6 py-2 font-bold bg-primary text-foreground hover:bg-foreground hover:text-background transition-colors"
                >
                    SIGN IN TO START
                </button>
            </div>
        );
    }

    // LOGIC: 
    // 1. If Quiz Completed AND User has NO submission OR submission is NOT completed -> Show "Ended" message.
    // 2. If User has Completed Submission -> Show Result (handled by QuizRunner).
    // 3. If Quiz Active -> Show Quiz Runner (Taking mode).

    if (quiz.status === 'completed' && (!submission || submission.status !== 'completed')) {
        return (
            <div className="min-h-screen bg-gray-50 py-12 px-4 flex flex-col items-center">
                <button
                    onClick={() => router.push('/')}
                    className="self-start mb-8 border-2 border-foreground px-4 py-2 font-bold bg-background hover:bg-foreground hover:text-background transition-colors"
                    style={{ fontFamily: "'Space Mono', monospace" }}
                >
                    ← BACK TO HUB
                </button>
                <div className="max-w-2xl w-full border-4 border-foreground bg-background p-10 text-center shadow-[8px_8px_0px_0px_#3D5A5B]">
                    <h1 className="text-4xl font-black mb-4 text-gray-400">QUIZ ENDED</h1>
                    <p className="text-xl mb-6">This quiz is no longer accepting submissions.</p>
                    <p className="text-gray-600 mb-8">You did not participate in this quiz while it was active.</p>
                    <button
                        onClick={() => router.push('/')}
                        className="px-8 py-3 bg-foreground text-background font-bold border-2 border-foreground hover:bg-primary hover:text-foreground transition-colors"
                    >
                        EXPLORE OTHER QUIZZES
                    </button>
                </div>
            </div>
        );
    }

    // Show Runner (either Result mode or Taking mode)
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <button
                onClick={() => router.push('/')}
                className="mb-8 border-2 border-foreground px-4 py-2 font-bold bg-background hover:bg-foreground hover:text-background transition-colors"
                style={{ fontFamily: "'Space Mono', monospace" }}
            >
                ← BACK TO HUB
            </button>
            <QuizRunner quiz={quiz} user={currentUser} existingSubmission={submission} />
        </div>
    );
}
