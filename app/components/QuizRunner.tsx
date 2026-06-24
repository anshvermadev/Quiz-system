import React, { useState, useEffect } from 'react';
import { Quiz, Question, QuizSubmission } from '../types';
import { useQuizzes } from '../context/QuizContext';

interface QuizRunnerProps {
    quiz: Quiz;
    user: any;
    existingSubmission?: QuizSubmission | null;
}

export default function QuizRunner({ quiz, user, existingSubmission }: QuizRunnerProps) {
    const { submitQuiz, updateQuizProgress } = useQuizzes();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
    const [isFinished, setIsFinished] = useState(false);
    const [score, setScore] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [startTime] = useState(Date.now());

    // Initialize state from existing submission if present
    useEffect(() => {
        if (existingSubmission && existingSubmission.status === 'completed') {
            setSelectedAnswers(existingSubmission.answers || {});
            setScore(existingSubmission.score);
            setIsFinished(true);
        } else if (existingSubmission && existingSubmission.status === 'in-progress') {
            // Resume progress
            setSelectedAnswers(existingSubmission.answers || {});
            if (existingSubmission.lastQuestionIndex !== undefined) {
                setCurrentIndex(existingSubmission.lastQuestionIndex);
            }
        } else {
            // New Start - Initial Save
            if (user && user.uid) {
                updateQuizProgress(quiz.id, user.uid, {
                    userId: user.uid,
                    userName: user.name || user.displayName || 'Anonymous',
                    userEmail: user.email || 'No Email',
                    quizId: quiz.id,
                    status: 'in-progress',
                    startedAt: new Date(startTime).toISOString(),
                    totalQuestions: quiz.questions.length,
                    score: 0,
                    lastQuestionIndex: 0,
                    answers: {}
                });
            }
        }
    }, [existingSubmission, quiz.id, user]); // Run once on mount/load

    const questions = quiz.questions || [];
    const currentQuestion = questions[currentIndex];
    const totalQuestions = questions.length;

    const handleOptionSelect = (optionIndex: number) => {
        if (isFinished) return;

        const newAnswers = {
            ...selectedAnswers,
            [currentQuestion.id]: optionIndex
        };
        setSelectedAnswers(newAnswers);
    };

    const handleNext = () => {
        // Save Progress
        updateQuizProgress(quiz.id, user.uid || '', {
            answers: selectedAnswers,
            lastQuestionIndex: currentIndex + 1, // Store index of NEXT question (or current if we want that)
            // Typically we store where they ARE. So if they finish Q1 (idx 0) and go to Q2 (idx 1), lastQuestionIndex should be 1.
            status: 'in-progress'
        });

        if (currentIndex < totalQuestions - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            finishQuiz();
        }
    };

    const finishQuiz = async () => {
        setSubmitting(true);
        // Calculate Score
        let correctCount = 0;
        questions.forEach(q => {
            if (selectedAnswers[q.id] === q.correctOptionIndex) {
                correctCount++;
            }
        });
        setScore(correctCount);

        const timeTaken = Math.round((Date.now() - startTime) / 1000); // Seconds

        try {
            await submitQuiz(quiz.id, selectedAnswers, correctCount, totalQuestions, user, timeTaken, new Date(startTime).toISOString());
            setIsFinished(true);
        } catch (error) {
            console.error("Failed to submit result", error);
            alert("Failed to submit quiz. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    // CASE 1: Quiz is Finished (either just now or from existing submission)
    if (isFinished) {
        const percentage = Math.round((score / totalQuestions) * 100);

        // Check visibility logic: 
        // 1. If Admin Toggle "Show Details" is ON -> Show complete details.
        // 2. If Quiz is COMPLETED (Inactive) -> Show complete details (User requested this).
        // 3. Otherwise -> Show only summary.
        const showDetails = quiz.showAnswerDetails || quiz.status === 'completed';

        return (
            <div className="max-w-4xl mx-auto border-4 border-foreground p-8 text-center bg-background">
                <h2 className="text-4xl font-black mb-6" style={{ fontFamily: "'Space Mono', monospace" }}>
                    {existingSubmission ? "PREVIOUS RESULT" : "QUIZ COMPLETED"}
                </h2>
                <div className="text-6xl font-bold text-primary mb-4">{percentage}%</div>
                <p className="text-xl mb-8">You scored {score} out of {totalQuestions}</p>

                {showDetails && (
                    <div className="space-y-4 text-left">
                        {questions.map((q, idx) => {
                            const isCorrect = selectedAnswers[q.id] === q.correctOptionIndex;
                            const userAnswerIdx = selectedAnswers[q.id];
                            return (
                                <div key={q.id} className={`p-4 border-2 border-foreground ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                                    <div className="font-bold">Q{idx + 1}: {q.title}</div>
                                    <div>Your Answer: {userAnswerIdx !== undefined ? q.options[userAnswerIdx] : 'Skipped'}</div>
                                    {!isCorrect && <div className="text-green-700 font-bold">Correct Answer: {q.options[q.correctOptionIndex]}</div>}
                                </div>
                            )
                        })}
                    </div>
                )}

                {!showDetails && (
                    <div className="p-6 bg-gray-100 border-2 border-foreground mb-8">
                        <p className="text-gray-600 italic">
                            Detailed results are currently hidden.
                            {quiz.status === 'active' ? " They will be available once the quiz is marked as completed by the admin." : ""}
                        </p>
                    </div>
                )}

                <a href="/" className="inline-block mt-8 border-2 border-foreground px-8 py-3 font-bold hover:bg-foreground hover:text-background transition-colors">
                    RETURN HOME
                </a>
            </div>
        );
    }

    // CASE 2: Quiz is Active BUT User has no submission -> Allow taking it.
    // (If user had submission, useEffect would have set isFinished=true)

    if (!currentQuestion) return <div>Loading...</div>;

    const progress = ((currentIndex + 1) / totalQuestions) * 100;

    return (
        <div className="max-w-4xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-6">
                <div className="flex justify-between text-sm font-bold mb-2" style={{ fontFamily: "'Space Mono', monospace" }}>
                    <span>QUESTION {currentIndex + 1} OF {totalQuestions}</span>
                    <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-4 border-2 border-foreground bg-background">
                    <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }}></div>
                </div>
            </div>

            {/* Question Card */}
            <div className="border-4 border-foreground bg-background p-6 md:p-10">
                <h2 className="text-2xl md:text-3xl font-black mb-6 tracking-tighter uppercase">{currentQuestion.instruction}</h2>

                {/* Image */}
                {currentQuestion.image && (
                    <div className="mb-8 border-4 border-foreground overflow-hidden bg-gray-100">
                        <img src={currentQuestion.image} alt="Sign" className="w-full h-auto max-h-[500px] object-contain" />
                    </div>
                )}

                {/* Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {currentQuestion.options.map((option, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleOptionSelect(idx)}
                            className={`p-4 border-2 border-foreground text-left font-bold text-lg transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#3D5A5B] 
                                ${selectedAnswers[currentQuestion.id] === idx ? 'bg-primary text-foreground' : 'bg-background hover:bg-highlight'}
                            `}
                        >
                            <span className="mr-3">{String.fromCharCode(65 + idx)}.</span>
                            {option}
                        </button>
                    ))}
                </div>

                {/* Navigation */}
                <div className="text-right">
                    <button
                        onClick={handleNext}
                        disabled={selectedAnswers[currentQuestion.id] === undefined || submitting}
                        className={`px-8 py-3 border-2 border-foreground font-bold text-lg 
                            ${selectedAnswers[currentQuestion.id] !== undefined ? 'bg-foreground text-background hover:opacity-80' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
                        `}
                    >
                        {submitting ? 'SUBMITTING...' : currentIndex === totalQuestions - 1 ? 'SUBMIT QUIZ' : 'NEXT QUESTION'}
                    </button>
                </div>
            </div>
        </div>
    );
}
