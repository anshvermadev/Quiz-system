'use client';

import React from 'react';
import { useQuizzes } from './context/QuizContext';
import QuizCard from './components/QuizCard';

export default function Home() {
  const { quizzes: contextQuizzes } = useQuizzes();
  const [quizzes, setQuizzes] = React.useState<typeof contextQuizzes>([]);

  React.useEffect(() => {
    // Load from cache initially
    const cached = localStorage.getItem('home_quizzes_cache');
    if (cached) {
      try {
        setQuizzes(JSON.parse(cached));
      } catch (e) {
        console.error("Error parsing quiz cache", e);
      }
    }
  }, []);

  React.useEffect(() => {
    // Update when context provides data
    if (contextQuizzes.length > 0) {
      setQuizzes(contextQuizzes);
      localStorage.setItem('home_quizzes_cache', JSON.stringify(contextQuizzes));
    }
  }, [contextQuizzes]);

  return (
    <main>
      {/* Hero Section */}
      <section className="border-b-4 border-foreground bg-primary text-foreground overflow-hidden relative">
        {/* Decorative Background Element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent opacity-20 transform translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-8 py-20 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* Left Column: Title */}
            <div className="lg:col-span-7 relative z-10">
              <div className="inline-block border-2 border-foreground px-4 py-1 mb-6 rounded-full bg-highlight text-sm font-bold tracking-widest uppercase">
                E-Cell BVUDET
              </div>
              <h2 className="text-7xl lg:text-9xl font-black tracking-tighter leading-[0.85] mb-6">
                E-CELL
                <span className="block text-foreground/80" style={{ fontFamily: "'EB Garamond', serif", fontStyle: "italic" }}>QUIZZES.</span>
              </h2>
            </div>

            {/* Right Column: Description & Details */}
            <div className="lg:col-span-5 relative z-10 flex flex-col justify-center h-full">
              <div className="bg-background/50 backdrop-blur-sm border-2 border-foreground p-8 rounded-2xl shadow-[8px_8px_0px_0px_rgba(61,90,91,1)]">
                <p className="text-xl lg:text-2xl mb-6 leading-relaxed" style={{ fontFamily: "'Space Mono', monospace" }}>
                  The official platform for engaging quizzes and competitions by E-Cell BVUDET Navi Mumbai.
                </p>
                <div className="h-1 w-full bg-foreground/10 my-6"></div>
                <p className="text-sm font-bold uppercase tracking-wider text-foreground/70">
                  Test your knowledge, compete with peers, and top the leaderboard.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Available Quizzes */}
      <section className="py-16 px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-black mb-12 tracking-tighter" style={{ fontFamily: "'Space Mono', monospace" }}>AVAILABLE QUIZZES.</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {quizzes.filter(p => p.status !== 'draft').map((quiz) => (
              <QuizCard key={quiz.id} quiz={quiz} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}