'use client';

import React from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal() {
    const { showAuthModal, setShowAuthModal, login } = useAuth();

    if (!showAuthModal) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 font-sans">
            <div className="bg-white border-4 border-black max-w-md w-full p-8 relative">
                <button
                    onClick={() => setShowAuthModal(false)}
                    className="absolute top-4 right-4 hover:bg-black hover:text-white p-2 transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                <h2 className="text-3xl font-black mb-6 tracking-tighter">SIGN IN TO QUIZ</h2>
                <p className="mb-6" style={{ fontFamily: "'Space Mono', monospace" }}>
                    Please sign in with Google to verify your identity and start the quiz.
                </p>

                <div>
                    <button
                        onClick={login}
                        className="w-full border-2 border-black bg-white text-black px-6 py-3 font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-3"
                        style={{ fontFamily: "'Space Mono', monospace" }}
                    >
                        <img
                            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                            alt="Google G"
                            className="w-6 h-6"
                        />
                        SIGN IN WITH GOOGLE
                    </button>

                    <p className="text-xs mt-4 text-gray-500 text-center" style={{ fontFamily: "'Space Mono', monospace" }}>
                        Participate in E-Cell quizzes and view your results.
                    </p>
                </div>
            </div>
        </div>
    );
}
