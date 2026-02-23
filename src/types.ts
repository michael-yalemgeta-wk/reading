export interface Choice {
    text: string;
    is_correct: boolean;
    explanation?: string;
}

export interface Question {
    id: string;
    question: string;
    background_knowledge?: string;
    explanation?: string;
    choices: Choice[];
}

export type QuizMode = 'learning' | 'test';

export interface QuizState {
    questions: Question[];
    currentQuestionIndex: number;
    userAnswers: (number | null)[];
    mode: QuizMode;
    isFinished: boolean;
}

// Logic for redundancy fix
export const HISTORY_KEY = 'quiz_question_history';
const MAX_HISTORY = 50;

export const getHistory = (): string[] => {
    const history = localStorage.getItem(HISTORY_KEY);
    return history ? JSON.parse(history) : [];
};

export const addToHistory = (questionIds: string[]) => {
    let history = getHistory();
    history = [...new Set([...questionIds, ...history])].slice(0, MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
};

export const filterQuestions = (allQuestions: Question[], count: number): Question[] => {
    const history = getHistory();

    // 1. Shuffle the entire question pool first (Fisher-Yates)
    const shuffled = [...allQuestions];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // 2. Sort questions: those NOT in history first
    const sorted = shuffled.sort((a, b) => {
        const aInHistory = history.includes(a.id);
        const bInHistory = history.includes(b.id);
        if (aInHistory && !bInHistory) return 1;
        if (!aInHistory && bInHistory) return -1;
        return 0; // if both are same history state, retain shuffled order
    });

    // 3. Take the top 'count' questions
    return sorted.slice(0, Math.min(count, sorted.length));
};
