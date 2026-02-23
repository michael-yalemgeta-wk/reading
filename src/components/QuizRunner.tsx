import React, { useState, useEffect } from 'react';
import './QuizRunner.css';
import type { Question, QuizMode } from '../types';

import QuestionCard from './QuestionCard';

interface QuizRunnerProps {
    questions: Question[];
    mode: QuizMode;
    onFinish: (answers: (number | null)[]) => void;
}

const TEST_MODE_TIME_LIMIT_PER_Q = 30; // 30 seconds per question

const QuizRunner: React.FC<QuizRunnerProps> = ({ questions, mode, onFinish }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null));
    const [showFeedback, setShowFeedback] = useState(false);

    // Timer state for Test mode
    const [timeLeft, setTimeLeft] = useState(TEST_MODE_TIME_LIMIT_PER_Q);

    const currentQuestion = questions[currentIndex];
    const isLastQuestion = currentIndex === questions.length - 1;
    const currentAnswer = userAnswers[currentIndex];

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setShowFeedback(false);
            if (mode === 'test') {
                setTimeLeft(TEST_MODE_TIME_LIMIT_PER_Q); // Reset timer for next question
            }
        } else {
            onFinish(userAnswers);
        }
    };

    useEffect(() => {
        if (mode !== 'test') return;

        // If question already answered in test mode, don't run timer down further
        if (currentAnswer !== null) return;

        if (timeLeft <= 0) {
            // Auto submit empty answer if time runs out
            const newAnswers = [...userAnswers];
            newAnswers[currentIndex] = -1; // -1 to indicate timeout
            setUserAnswers(newAnswers);
            handleNext();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, mode, currentAnswer, currentIndex, userAnswers]);

    const handleAnswer = (choiceIndex: number) => {
        if (userAnswers[currentIndex] !== null) return; // Don't re-answer

        const newAnswers = [...userAnswers];
        newAnswers[currentIndex] = choiceIndex;
        setUserAnswers(newAnswers);

        if (mode === 'learning') {
            setShowFeedback(true);
        }
    };

    const progress = ((currentIndex + 1) / questions.length) * 100;

    // Helper for formatting time
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="quiz-runner fade-in">
            <div className="quiz-progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                <span className="progress-text">Question {currentIndex + 1} of {questions.length}</span>
            </div>

            <div className="quiz-info-header">
                <div className="mode-badge">
                    {mode === 'learning' ? '📚 Learning Mode' : '📝 Test Mode'}
                </div>
                {mode === 'test' && (
                    <div className={`timer-badge ${timeLeft <= 5 ? 'danger' : ''}`}>
                        ⏱ {formatTime(timeLeft)}
                    </div>
                )}
            </div>

            <QuestionCard
                question={currentQuestion}
                mode={mode}
                onAnswer={handleAnswer}
                showFeedback={mode === 'learning' ? showFeedback : false}
                selectedChoice={currentAnswer}
                onNext={handleNext}
            />

            <div className="runner-controls">
                {/* Learning Mode: Next button appears after feedback */}
                {mode === 'learning' && showFeedback && (
                    <button className="btn-primary next-btn fade-in" onClick={handleNext}>
                        {isLastQuestion ? '🏁 See Results' : 'Next Question →'}
                    </button>
                )}

                {/* Test Mode: Next button always available after answering */}
                {mode === 'test' && currentAnswer !== null && (
                    <button className="btn-primary next-btn fade-in" onClick={handleNext}>
                        {isLastQuestion ? '🏁 Finish Quiz & See Results' : 'Next Question →'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default QuizRunner;
