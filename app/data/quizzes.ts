import { Quiz } from '../types';

export const initialQuizzes: Quiz[] = [
    {
        id: 'quiz-asl-basics',
        title: 'ASL Basics: Alphabet & Numbers',
        description: 'Test your knowledge of the American Sign Language alphabet and basic numbers. Identify the signs shown in the images.',
        coverImage: 'https://placehold.co/800x450/png?text=ASL+Basics+Cover',
        status: 'active',
        createdAt: new Date().toISOString(),
        createdBy: 'admin-seed',
        questions: [
            {
                id: 'q1',
                title: 'Identify the Letter',
                // image removed for testing text-only question
                instruction: 'Which letter does this ASL sign represent? (Text Only Test)',
                options: ['A', 'B', 'M', 'S'],
                correctOptionIndex: 0
            },
            {
                id: 'q2',
                title: 'Identify the Letter',
                image: 'https://placehold.co/800x450/png?text=Sign+L',
                instruction: 'Which letter does this ASL sign represent?',
                options: ['V', 'L', 'D', 'G'],
                correctOptionIndex: 1
            },
            {
                id: 'q3',
                title: 'Identify the Number',
                image: 'https://placehold.co/800x450/png?text=Sign+5',
                instruction: 'What number is being shown?',
                options: ['3', '4', '5', '10'],
                correctOptionIndex: 2
            }
        ]
    },
    {
        id: 'quiz-common-phrases',
        title: 'Common Phrases - Daily Life',
        description: 'Challenge yourself with common daily phrases and greetings in ASL.',
        status: 'active',
        createdAt: new Date().toISOString(),
        createdBy: 'admin-seed',
        questions: [
            {
                id: 'q1',
                title: 'Identify the Phrase',
                image: 'https://placehold.co/800x450/png?text=Sign+Hello',
                instruction: 'What phrase is being signed?',
                options: ['Goodbye', 'Hello', 'Thank You', 'Please'],
                correctOptionIndex: 1
            },
            {
                id: 'q2',
                title: 'Identify the Phrase',
                image: 'https://placehold.co/800x450/png?text=Sign+Thank+You',
                instruction: 'What phrase is being signed?',
                options: ['Sorry', 'Yes', 'No', 'Thank You'],
                correctOptionIndex: 3
            }
        ]
    }
];
