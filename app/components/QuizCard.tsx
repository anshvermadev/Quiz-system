'use client';

import React from 'react';
import Link from 'next/link';
import { Quiz } from '../types';

interface QuizCardProps {
    quiz: Quiz;
}

export default function QuizCard({ quiz }: QuizCardProps) {
    // Determine image: Cover Image -> First Question Image -> Placeholder
    const headerImage = quiz.coverImage
        ? quiz.coverImage
        : (quiz.questions && quiz.questions.length > 0 && quiz.questions[0].image)
            ? quiz.questions[0].image
            : 'https://placehold.co/800x450/png?text=Quiz';

    return (
        <Link href={`/quizzes/${quiz.id}`}>
            <div className="border-4 border-foreground bg-background cursor-pointer transition-all duration-300 shadow-[8px_8px_0px_0px_#3D5A5B] hover:-translate-y-2 hover:shadow-[16px_16px_0px_0px_#3D5A5B] hover:border-primary h-full flex flex-col">
                <img
                    src={headerImage}
                    alt={quiz.title}
                    className="w-full aspect-video object-cover border-b-4 border-foreground"
                />
                <div className="p-6 flex flex-col flex-grow relative">
                    <div className="flex justify-between items-start mb-2">
                        <div className="text-xs font-bold text-primary" style={{ fontFamily: "'Space Mono', monospace" }}>
                            {quiz.questions?.length || 0} QUESTIONS
                        </div>
                        {quiz.status === 'completed' && (
                            <span className="bg-green-600 text-white text-[10px] px-2 py-1 font-bold" style={{ fontFamily: "'Space Mono', monospace" }}>
                                COMPLETED
                            </span>
                        )}
                    </div>
                    <h3 className="text-xl md:text-2xl font-black mb-3 tracking-tighter break-words uppercase">{quiz.title}</h3>
                    <p className="mb-4 text-sm flex-grow" style={{ fontFamily: "'Space Mono', monospace" }}>
                        {quiz.description?.substring(0, 120)}...
                    </p>
                    <div className="flex justify-between items-center text-sm border-t-2 border-foreground pt-4" style={{ fontFamily: "'Space Mono', monospace" }}>
                        <span className="font-bold">START QUIZ</span>
                        <span>&rarr;</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
