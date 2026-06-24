'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useQuizzes } from '../context/QuizContext';
import { db } from '../lib/firebase';
import { deleteDoc, doc, updateDoc, collection, getDocs, writeBatch } from 'firebase/firestore';
import { Trash2, Edit, Plus, BarChart2, Eye, CheckCircle, XCircle, FileText, FileMinus } from 'lucide-react';
import QuizBuilder from '../components/admin/QuizBuilder';
import { Quiz } from '../types';
import { useRouter } from 'next/navigation';

import toast from 'react-hot-toast';

export default function AdminPage() {
    const { currentUser } = useAuth();
    const { quizzes } = useQuizzes();
    const router = useRouter();
    const [isBuilderOpen, setIsBuilderOpen] = useState(false);
    const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);

    // Delete Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [quizToDelete, setQuizToDelete] = useState<Quiz | null>(null);

    // Protect route: 404 if not admin
    if (!currentUser?.isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <h1 className="text-9xl font-black mb-4">404</h1>
                <p className="text-xl font-bold mb-8">PAGE NOT FOUND</p>
                <a href="/" className="border-2 border-foreground px-6 py-3 font-bold hover:bg-foreground hover:text-background transition-colors">
                    RETURN HOME
                </a>
            </div>
        );
    }

    const confirmDelete = async () => {
        if (!quizToDelete) return;

        try {
            // 1. Delete all submissions (cascading delete)
            const submissionsRef = collection(db, 'quizzes', quizToDelete.id, 'submissions');
            const subSnap = await getDocs(submissionsRef);

            // Delete in batches (max 500 ops per batch)
            const batch = writeBatch(db);
            subSnap.docs.forEach((doc) => {
                batch.delete(doc.ref);
            });
            await batch.commit();

            // 2. Delete the quiz document
            await deleteDoc(doc(db, 'quizzes', quizToDelete.id));

            setDeleteModalOpen(false);
            setQuizToDelete(null);
            toast.success("Quiz deleted successfully");
        } catch (error) {
            console.error("Error deleting quiz:", error);
            toast.error("Failed to delete quiz. See console.");
        }
    };

    const toggleStatus = async (quiz: Quiz) => {
        const newStatus = quiz.status === 'active' ? 'completed' : 'active';
        await updateDoc(doc(db, 'quizzes', quiz.id), { status: newStatus });
    };

    const toggleDetails = async (quiz: Quiz) => {
        const newSetting = !quiz.showAnswerDetails;
        await updateDoc(doc(db, 'quizzes', quiz.id), { showAnswerDetails: newSetting });
    };

    return (
        <div className="max-w-7xl mx-auto px-8 py-12">
            <div className="flex justify-between items-center mb-12 border-b-4 border-foreground pb-8">
                <div>
                    <h1 className="text-5xl font-black tracking-tighter mb-2">CONTROL TOWER</h1>
                    <p className="font-mono text-gray-600">Quiz Management & Real-time Monitoring.</p>
                </div>
                <button
                    onClick={() => { setEditingQuiz(null); setIsBuilderOpen(true); }}
                    className="flex items-center gap-2 border-2 border-foreground bg-foreground text-background px-4 py-2 font-bold hover:bg-primary transition-colors hover:text-foreground"
                >
                    <Plus className="w-4 h-4" /> CREATE QUIZ
                </button>
            </div>

            {/* Quiz List */}
            <h2 className="text-3xl font-black mb-8 tracking-tighter">ALL QUIZZES</h2>
            <div className="grid gap-6">
                {quizzes.map(quiz => (
                    <div key={quiz.id} className="border-4 border-foreground p-6 bg-background shadow-[4px_4px_0px_0px_#3D5A5B] flex flex-col md:flex-row justify-between items-center gap-4 transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_#3D5A5B]">
                        <div className="flex-grow">
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`text-xs font-bold px-2 py-1 border border-foreground ${quiz.status === 'active' ? 'bg-green-200 text-green-800' : 'bg-gray-200'}`}>
                                    {quiz.status.toUpperCase()}
                                </span>
                                <span className="text-xs text-gray-500 font-mono">{quiz.id}</span>
                            </div>
                            <h3 className="text-xl font-black">{quiz.title}</h3>
                            <p className="text-sm text-gray-600">{quiz.questions?.length || 0} Questions</p>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => router.push(`/admin/analytics/${quiz.id}`)}
                                className="group relative p-2 border-2 border-foreground hover:bg-highlight text-purple-600 transition-all duration-200 hover:scale-110 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#3D5A5B]"
                            >
                                <BarChart2 className="w-5 h-5" />
                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-1 bg-foreground text-background text-sm font-black whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-[4px_4px_0px_0px_white] z-10">
                                    Analytics
                                </span>
                            </button>
                            <button
                                onClick={() => toggleStatus(quiz)}
                                className={`group relative p-2 border-2 border-foreground transition-all duration-200 hover:scale-110 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#3D5A5B] ${quiz.status === 'active'
                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                    : 'bg-gray-300 hover:bg-gray-400'
                                    }`}
                            >
                                {quiz.status === 'active' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-1 bg-foreground text-background text-sm font-black whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-[4px_4px_0px_0px_white] z-10">
                                    {quiz.status === 'active' ? 'Mark Completed' : 'Mark Ongoing'}
                                </span>
                            </button>
                            <button
                                onClick={() => { setEditingQuiz(quiz); setIsBuilderOpen(true); }}
                                className="group relative p-2 border-2 border-foreground hover:bg-highlight text-blue-600 transition-all duration-200 hover:scale-110 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#3D5A5B]"
                            >
                                <Edit className="w-5 h-5" />
                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-1 bg-foreground text-background text-sm font-black whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-[4px_4px_0px_0px_white] z-10">
                                    Edit Quiz
                                </span>
                            </button>
                            <button
                                onClick={() => toggleDetails(quiz)}
                                className={`group relative p-2 border-2 border-foreground transition-all duration-200 hover:scale-110 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#3D5A5B] ${quiz.showAnswerDetails
                                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                    : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                    }`}
                            >
                                {quiz.showAnswerDetails ? <FileText className="w-5 h-5" /> : <FileMinus className="w-5 h-5" />}
                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-1 bg-foreground text-background text-sm font-black whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-[4px_4px_0px_0px_white] z-10">
                                    {quiz.showAnswerDetails ? 'Hide Details' : 'Show Details'}
                                </span>
                            </button>
                            <button
                                onClick={() => { setQuizToDelete(quiz); setDeleteModalOpen(true); }}
                                className="group relative p-2 border-2 border-foreground hover:bg-red-500 hover:text-white text-red-600 transition-all duration-200 hover:scale-110 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#3D5A5B]"
                            >
                                <Trash2 className="w-5 h-5" />
                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-1 bg-foreground text-background text-sm font-black whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-[4px_4px_0px_0px_white] z-10">
                                    Delete Quiz
                                </span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Delete Modal */}
            {deleteModalOpen && quizToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-background border-4 border-foreground w-full max-w-md p-8 shadow-[8px_8px_0px_0px_#3D5A5B]">
                        <div className="flex justify-center mb-4 text-red-600">
                            <Trash2 className="w-16 h-16" />
                        </div>
                        <h2 className="text-3xl font-black mb-4 text-center text-red-600">DELETE QUIZ?</h2>
                        <p className="font-bold text-center mb-2">
                            Are you sure you want to delete "{quizToDelete.title}"?
                        </p>
                        <p className="text-sm text-gray-600 text-center mb-8">
                            This will also delete ALL student submissions for this quiz. This action cannot be undone.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={confirmDelete}
                                className="flex-1 bg-red-600 text-white py-3 font-black border-2 border-foreground hover:bg-red-700 hover:scale-105 transition-all"
                            >
                                DELETE
                            </button>
                            <button
                                onClick={() => { setDeleteModalOpen(false); setQuizToDelete(null); }}
                                className="flex-1 bg-background py-3 font-black border-2 border-foreground hover:bg-gray-100 hover:scale-105 transition-all"
                            >
                                CANCEL
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isBuilderOpen && (
                <QuizBuilder
                    existingQuiz={editingQuiz}
                    onClose={() => setIsBuilderOpen(false)}
                    currentUserId={currentUser.uid}
                />
            )}
        </div>
    );
}
