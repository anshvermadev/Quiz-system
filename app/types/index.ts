export interface Question {
  id: string;
  title: string;
  image?: string;
  instruction: string;
  options: string[];
  correctOptionIndex: number;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  coverImage?: string;
  status: 'active' | 'completed' | 'draft';
  questions: Question[];
  createdBy: string; // admin ID
  createdAt: string;
  showAnswerDetails?: boolean;
}

export interface QuizSubmission {
  userId: string;
  quizId: string;
  answers: Record<string, number>; // questionId -> selectedOptionIndex
  score: number;
  totalQuestions: number;
  completedAt: string;
  userName: string;
  userEmail: string;
  timeTaken: number; // in seconds
  startedAt?: string; // ISO String
  status: 'in-progress' | 'completed';
  lastQuestionIndex: number;
}

export interface User {
  uid: string;
  name: string;
  email: string;
  isAdmin?: boolean;
}

export interface AuthForm {
  name: string;
  email: string;
}