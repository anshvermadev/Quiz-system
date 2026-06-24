'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuizzes } from '../../../context/QuizContext';
import { collection, getDocs, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { Quiz, QuizSubmission } from '../../../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ArrowLeft, Clock, Award, Download } from 'lucide-react';

export default function AnalyticsPage() {
    const { id } = useParams();
    const router = useRouter();
    const { getQuiz } = useQuizzes();
    const [submissions, setSubmissions] = useState<QuizSubmission[]>([]);
    const [loading, setLoading] = useState(true);

    const quiz = getQuiz(id as string);

    useEffect(() => {
        if (!id) return;
        const q = query(collection(db, 'quizzes', id as string, 'submissions'));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const subs = querySnapshot.docs.map(doc => doc.data() as QuizSubmission);

            // SORTING LOGIC (Leaderboard):
            // 1. Score Descending (Highest Score First)
            // 2. Time Taken Ascending (Fastest Time First)
            subs.sort((a, b) => {
                const scoreA = a.score || 0; // Handle undefined score for in-progress
                const scoreB = b.score || 0;

                if (scoreB !== scoreA) {
                    return scoreB - scoreA;
                }
                return (a.timeTaken || 999999) - (b.timeTaken || 999999);
            });

            setSubmissions(subs);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [id]);

    if (!quiz) return <div className="p-8">Loading Quiz...</div>;
    if (loading) return <div className="p-8">Loading Analytics...</div>;

    // Calculate Question Stats
    const questionStats = quiz.questions.map((q, idx) => {
        let correct = 0;
        let incorrect = 0;
        submissions.forEach(sub => {
            if (sub.answers[q.id] === q.correctOptionIndex) correct++;
            else incorrect++;
        });
        const total = correct + incorrect;
        return {
            name: `Q${idx + 1}`,
            fullTitle: q.title,
            correct,
            incorrect,
            passRate: total > 0 ? Math.round((correct / total) * 100) : 0
        };
    });

    // Format Time Function
    const formatTime = (seconds: number) => {
        if (!seconds) return 'N/A';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    const downloadCSV = () => {
        const headers = ['Rank', 'Student', 'Email', 'Score', 'Total Questions', 'Status', 'Start Time (IST)', 'End Time (IST)', 'Time Taken'];

        const rows = submissions.map((sub, idx) => {
            const startTime = sub.startedAt
                ? new Date(sub.startedAt).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })
                : '-';

            const endTime = sub.status === 'completed' && sub.completedAt
                ? new Date(sub.completedAt).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })
                : '-';

            const timeTaken = sub.status === 'completed' ? formatTime(sub.timeTaken) : '-';
            const status = sub.status === 'completed' ? 'COMPLETED' : `In Progress (Q${(sub.lastQuestionIndex || 0) + 1})`;

            return [
                idx + 1,
                `"${sub.userName || 'Anonymous'}"`, // Quote to handle commas in names
                sub.userEmail || 'No Email',
                sub.score || 0,
                quiz.questions.length,
                status,
                startTime,
                endTime,
                timeTaken
            ].join(',');
        });

        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `${quiz.title.replace(/\s+/g, '_')}_results.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12 overflow-x-hidden">
            <button
                onClick={() => router.push('/admin')}
                className="mb-8 flex items-center gap-2 font-bold hover:underline"
            >
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </button>

            <div className="border-b-4 border-foreground pb-6 mb-8 md:pb-8 md:mb-12">
                <h1 className="text-2xl md:text-4xl font-black mb-2 uppercase break-words">{quiz.title}</h1>
                <p className="font-mono text-sm md:text-base text-gray-500">ANALYTICS & LEADERBOARD</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                {/* Stat Cards */}
                <div className="border-4 border-foreground p-6 bg-background shadow-[8px_8px_0px_0px_#3D5A5B]">
                    <h3 className="text-sm font-bold text-gray-500 mb-2">TOTAL SUBMISSIONS</h3>
                    <p className="text-5xl font-black text-blue-600">{submissions.length}</p>
                </div>
                <div className="border-4 border-foreground p-6 bg-background shadow-[8px_8px_0px_0px_#3D5A5B]">
                    <h3 className="text-sm font-bold text-gray-500 mb-2">AVG. SCORE</h3>
                    <p className="text-5xl font-black text-green-600">
                        {submissions.length > 0
                            ? (submissions.reduce((acc, curr) => acc + curr.score, 0) / submissions.length).toFixed(1)
                            : '0'}
                        <span className="text-2xl text-foreground"> / {quiz.questions.length}</span>
                    </p>
                </div>
                <div className="border-4 border-foreground p-6 bg-background shadow-[8px_8px_0px_0px_#3D5A5B]">
                    <h3 className="text-sm font-bold text-gray-500 mb-2">AVG. TIME</h3>
                    <p className="text-5xl font-black text-purple-600">
                        {submissions.length > 0
                            ? formatTime(Math.round(submissions.reduce((acc, curr) => acc + (curr.timeTaken || 0), 0) / submissions.length))
                            : '0m 0s'}
                    </p>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                <div className="border-4 border-foreground p-6 bg-background">
                    <h3 className="text-xl font-black mb-6">QUESTION SUCCESS RATE</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={questionStats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 'bold' }} />
                                <YAxis />
                                <Tooltip
                                    contentStyle={{ border: '2px solid #3D5A5B', borderRadius: '0px' }}
                                    cursor={{ fill: '#f3f4f6' }}
                                />
                                <Bar dataKey="passRate" fill="#3D5A5B">
                                    {questionStats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.passRate > 70 ? '#22c55e' : entry.passRate < 40 ? '#ef4444' : '#eab308'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="border-4 border-foreground p-6 bg-background overflow-y-auto max-h-[400px]">
                    <h3 className="text-xl font-black mb-6">DIFFICULTY BREAKDOWN</h3>
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-100 font-bold border-b-2 border-foreground">
                            <tr>
                                <th className="p-2">Q</th>
                                <th className="p-2">Question</th>
                                <th className="p-2 text-right">Correct %</th>
                            </tr>
                        </thead>
                        <tbody>
                            {questionStats.map((stat, idx) => (
                                <tr key={idx} className="border-b border-gray-200">
                                    <td className="p-2 font-bold">{stat.name}</td>
                                    <td className="p-2 truncate max-w-[200px]" title={stat.fullTitle}>{stat.fullTitle}</td>
                                    <td className={`p-2 text-right font-bold ${stat.passRate > 70 ? 'text-green-600' : stat.passRate < 40 ? 'text-red-600' : 'text-yellow-600'}`}>
                                        {stat.passRate}%
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Leaderboard Table */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <h2 className="text-2xl md:text-3xl font-black flex items-center gap-3">
                    <Award className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                    LEADERBOARD
                </h2>
                <button
                    onClick={downloadCSV}
                    className="flex items-center justify-center gap-2 border-2 border-foreground px-4 py-2 font-bold bg-primary text-foreground hover:bg-foreground hover:text-background transition-colors w-full sm:w-auto"
                >
                    <Download className="w-5 h-5" />
                    EXPORT CSV
                </button>
            </div>
            <div className="border-4 border-foreground bg-background shadow-[8px_8px_0px_0px_#3D5A5B] flex flex-col">
                <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead className="bg-foreground text-background">
                            <tr>
                                <th className="p-4 font-bold border-r border-gray-500 w-16 sticky left-0 bg-foreground z-10">#</th>
                                <th className="p-4 font-bold border-r border-gray-500 sticky left-16 bg-foreground z-10">STUDENT</th>
                                <th className="p-4 font-bold border-r border-gray-500">EMAIL</th>
                                <th className="p-4 font-bold border-r border-gray-500 text-center">SCORE</th>
                                <th className="p-4 font-bold border-r border-gray-500 text-center">RESULT</th>
                                <th className="p-4 font-bold border-r border-gray-500 text-center">START (IST)</th>
                                <th className="p-4 font-bold text-center">END (IST)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {submissions.map((sub, idx) => (
                                <tr key={idx} className="border-b-2 border-gray-100 hover:bg-yellow-50 transition-colors group">
                                    <td className="p-4 font-black text-xl border-r-2 border-gray-100 text-center text-gray-400 sticky left-0 bg-background group-hover:bg-yellow-50 z-10 border-r-foreground/10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                        {idx + 1}
                                    </td>
                                    <td className="p-4 font-bold border-r-2 border-gray-100 flex items-center gap-2 sticky left-16 bg-background group-hover:bg-yellow-50 z-10 border-r-foreground/10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                        {idx === 0 && <Award className="w-5 h-5 text-yellow-500 shrink-0" />}
                                        {idx === 1 && <Award className="w-5 h-5 text-gray-400 shrink-0" />}
                                        {idx === 2 && <Award className="w-5 h-5 text-orange-700 shrink-0" />}
                                        <span className="truncate max-w-[150px]">{sub.userName || 'Anonymous'}</span>
                                    </td>
                                    <td className="p-4 font-mono text-sm text-gray-600 border-r-2 border-gray-100">
                                        {sub.userEmail || 'No Email'}
                                    </td>
                                    <td className="p-4 font-black text-center text-lg border-r-2 border-gray-100">
                                        {sub.status === 'completed' ? (
                                            <>
                                                <span className={sub.score === quiz.questions.length ? 'text-green-600' : ''}>
                                                    {sub.score}
                                                </span>
                                                <span className="text-gray-400 text-sm"> / {quiz.questions.length}</span>
                                            </>
                                        ) : (
                                            <span className="text-gray-400 text-sm italic">Pending</span>
                                        )}
                                    </td>
                                    <td className={`p-4 font-bold text-center border-r-2 border-gray-100 ${sub.status === 'completed' ? 'text-green-600' : 'text-orange-500'}`}>
                                        {sub.status === 'completed' ? 'COMPLETED' : `Q${(sub.lastQuestionIndex || 0) + 1} / ${quiz.questions.length}`}
                                    </td>
                                    <td className="p-4 font-mono text-center text-sm border-r-2 border-gray-100 whitespace-nowrap">
                                        {sub.startedAt
                                            ? new Date(sub.startedAt).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })
                                            : '-'}
                                    </td>
                                    <td className="p-4 font-mono text-center text-sm flex flex-col items-center whitespace-nowrap">
                                        {sub.status === 'completed' && sub.completedAt ? (
                                            <>
                                                <span>{new Date(sub.completedAt).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })}</span>
                                                <span className="text-xs text-gray-400">({formatTime(sub.timeTaken)})</span>
                                            </>
                                        ) : (
                                            <span className="text-orange-400 text-xs font-bold uppercase tracking-wider">In Progress</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {submissions.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-gray-500 italic">
                                        No submissions yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
