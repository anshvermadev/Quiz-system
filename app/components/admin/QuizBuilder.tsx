'use client';

import React, { useState } from 'react';
import { Quiz, Question } from '../../types';
import { Plus, Trash2, Image as ImageIcon, Save } from 'lucide-react';
import { generateSlug } from '../../lib/utils';
import { db } from '../../lib/firebase';
import { doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';

import toast from 'react-hot-toast';

interface QuizBuilderProps {
    existingQuiz?: Quiz | null;
    onClose: () => void;
    currentUserId: string;
}

export default function QuizBuilder({ existingQuiz, onClose, currentUserId }: QuizBuilderProps) {
    const [quiz, setQuiz] = useState<Partial<Quiz>>(existingQuiz || {
        title: '',
        description: '',
        status: 'draft',
        questions: []
    });

    const addQuestion = () => {
        const newQ: Question = {
            id: `q${Date.now()}`,
            title: '',
            image: '',
            instruction: '',
            options: ['', '', '', ''],
            correctOptionIndex: 0
        };
        setQuiz(prev => ({ ...prev, questions: [...(prev.questions || []), newQ] }));
    };

    const updateQuestion = (index: number, field: keyof Question, value: any) => {
        const newQuestions = [...(quiz.questions || [])];
        newQuestions[index] = { ...newQuestions[index], [field]: value };
        setQuiz(prev => ({ ...prev, questions: newQuestions }));
    };

    const updateOption = (qIndex: number, oIndex: number, value: string) => {
        const newQuestions = [...(quiz.questions || [])];
        const newOptions = [...newQuestions[qIndex].options];
        newOptions[oIndex] = value;
        newQuestions[qIndex].options = newOptions;
        setQuiz(prev => ({ ...prev, questions: newQuestions }));
    };

    const handleSave = async () => {
        if (!quiz.title) return toast.error("Title required");

        try {
            const quizId = quiz.id || generateSlug(quiz.title);
            const quizRef = doc(db, 'quizzes', quizId);

            // Check existence if new
            if (!quiz.id) {
                const check = await getDoc(quizRef);
                if (check.exists()) {
                    return toast.error("Quiz ID/Slug already exists. Change title.");
                }
            }

            const quizData: Quiz = {
                id: quizId,
                title: quiz.title!,
                description: quiz.description || '',
                status: quiz.status || 'draft',
                questions: quiz.questions || [],
                createdBy: quiz.createdBy || currentUserId,
                createdAt: quiz.createdAt || new Date().toISOString(),
                coverImage: quiz.coverImage || ''
            };

            await setDoc(quizRef, quizData);
            toast.success("Quiz saved successfully!");
            onClose();
        } catch (e) {
            console.error(e);
            toast.error("Error saving: " + e);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-background border-4 border-foreground w-full max-w-4xl p-8 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-black">{quiz.id ? 'EDIT QUIZ' : 'CREATE QUIZ'}</h2>
                    <button onClick={onClose} className="text-xl font-bold hover:text-red-500">X</button>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block font-bold mb-1">Title</label>
                        <input
                            className="w-full border-2 border-foreground p-2"
                            value={quiz.title}
                            onChange={e => setQuiz({ ...quiz, title: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block font-bold mb-1">Description</label>
                        <textarea
                            className="w-full border-2 border-foreground p-2 h-20"
                            value={quiz.description}
                            onChange={e => setQuiz({ ...quiz, description: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block font-bold mb-1">Cover Image URL (Optional)</label>
                        <input
                            className="w-full border-2 border-foreground p-2"
                            placeholder="https://example.com/image.jpg"
                            value={quiz.coverImage || ''}
                            onChange={e => setQuiz({ ...quiz, coverImage: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block font-bold mb-1">Status</label>
                        <select
                            className="border-2 border-foreground p-2"
                            value={quiz.status}
                            onChange={e => setQuiz({ ...quiz, status: e.target.value as any })}
                        >
                            <option value="draft">Draft</option>
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>

                    <div className="border-t-4 border-foreground pt-6">
                        <h3 className="text-2xl font-black mb-4">QUESTIONS</h3>
                        {quiz.questions?.map((q, qIdx) => (
                            <div key={q.id} className="border-2 border-foreground p-4 mb-4 bg-gray-50">
                                <div className="flex justify-between mb-2">
                                    <span className="font-bold">Question {qIdx + 1}</span>
                                    <button
                                        onClick={() => setQuiz(prev => ({ ...prev, questions: prev.questions?.filter((_, i) => i !== qIdx) }))}
                                        className="text-red-600 font-bold text-sm"
                                    >
                                        REMOVE
                                    </button>
                                </div>
                                <div className="grid gap-4">
                                    <input
                                        placeholder="Instruction (e.g. Identify this sign)"
                                        className="w-full border-2 border-foreground p-2"
                                        value={q.instruction}
                                        onChange={e => updateQuestion(qIdx, 'instruction', e.target.value)}
                                    />
                                    <input
                                        placeholder="Title (Short)"
                                        className="w-full border-2 border-foreground p-2"
                                        value={q.title}
                                        onChange={e => updateQuestion(qIdx, 'title', e.target.value)}
                                    />
                                    <div className="flex gap-2">
                                        <input
                                            placeholder="Image URL (Optional)"
                                            className="w-full border-2 border-foreground p-2"
                                            value={q.image || ''}
                                            onChange={e => updateQuestion(qIdx, 'image', e.target.value)}
                                        />
                                        {q.image && <img src={q.image} className="h-10 w-10 border border-foreground object-cover" />}
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        {q.options.map((opt, oIdx) => (
                                            <div key={oIdx} className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    name={`correct-${q.id}`}
                                                    checked={q.correctOptionIndex === oIdx}
                                                    onChange={() => updateQuestion(qIdx, 'correctOptionIndex', oIdx)}
                                                />
                                                <input
                                                    placeholder={`Option ${oIdx + 1}`}
                                                    className="w-full border-2 border-foreground p-1 text-sm"
                                                    value={opt}
                                                    onChange={e => updateOption(qIdx, oIdx, e.target.value)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button
                            onClick={addQuestion}
                            className="bg-foreground text-background px-4 py-2 font-bold border-2 border-foreground hover:bg-background hover:text-foreground transition-colors"
                        >
                            + ADD QUESTION
                        </button>
                    </div>

                    <div className="flex gap-4 border-t-4 border-foreground pt-6">
                        <button
                            onClick={handleSave}
                            className="flex-1 bg-green-600 text-white py-3 font-bold border-2 border-foreground hover:bg-green-700"
                        >
                            SAVE QUIZ
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 bg-gray-200 py-3 font-bold border-2 border-foreground hover:bg-gray-300"
                        >
                            CANCEL
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
