import React, { useState, useEffect, useCallback } from 'react';
import './QuestionCard.css';
import type { Question, QuizMode } from '../types';

interface QuestionCardProps {
    question: Question;
    mode: QuizMode;
    onAnswer: (choiceIndex: number) => void;
    showFeedback?: boolean;
    selectedChoice?: number | null;
    onNext?: () => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
    question,
    onAnswer,
    showFeedback = false,
    selectedChoice = null,
    onNext,
}) => {
    const [showBackground, setShowBackground] = useState(true);
    const [copied, setCopied] = useState(false);

    const handleCopyQuestion = () => {
        const text = `Question: ${question.question}\n\nChoices:\n${question.choices.map((c, i) => `${String.fromCharCode(65 + i)}. ${c.text}`).join('\n')}`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };


    const handleKeyPress = useCallback((event: KeyboardEvent) => {
        // Handle answer selection (1-4 or A-D)
        const key = event.key.toLowerCase();

        let choiceIndex = -1;
        if (key === '1' || key === 'a') choiceIndex = 0;
        else if (key === '2' || key === 'b') choiceIndex = 1;
        else if (key === '3' || key === 'c') choiceIndex = 2;
        else if (key === '4' || key === 'd') choiceIndex = 3;

        if (choiceIndex !== -1 && choiceIndex < question.choices.length && !showFeedback) {
            onAnswer(choiceIndex);
            return;
        }

        // Handle Enter for next question
        if (event.key === 'Enter' && onNext) {
            // In learning mode, we only allow Enter if feedback is shown
            // In test mode, we only allow Enter if an answer is selected
            if ((showFeedback) || (selectedChoice !== null)) {
                onNext();
            }
        }
    }, [question.choices.length, onAnswer, showFeedback, selectedChoice, onNext]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [handleKeyPress]);

    return (
        <div className="question-card fade-in">
            <div className="card-header">
                <div className="bg-knowledge-toggle" style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        className={`toggle-btn ${showBackground ? 'active' : ''}`}
                        onClick={() => setShowBackground(!showBackground)}
                    >
                        {showBackground ? 'Hide Background Info' : 'Show Background Info'}
                    </button>
                    <button className="btn-ghost small copy-q-btn" onClick={handleCopyQuestion}>
                        {copied ? '✓ Copied!' : '📋 Copy Question'}
                    </button>
                </div>
            </div>

            {showBackground && (
                <div className="background-knowledge glass-card">
                    <h3>Background Knowledge</h3>
                    <p>{question.background_knowledge}</p>
                </div>
            )}

            <div className="question-content glass-card">
                <h2 className="question-text">{question.question}</h2>

                <div className="choices-list">
                    {question.choices.map((choice, index) => {
                        let statusClass = '';
                        if (showFeedback) {
                            if (choice.is_correct) statusClass = 'correct';
                            else if (selectedChoice === index) statusClass = 'incorrect';
                        } else if (selectedChoice === index) {
                            statusClass = 'selected';
                        }

                        return (
                            <div key={index} className="choice-item-container">
                                <button
                                    className={`choice-btn ${statusClass}`}
                                    onClick={() => !showFeedback && onAnswer(index)}
                                    disabled={showFeedback}
                                >
                                    <span className="choice-label">{String.fromCharCode(65 + index)}</span>
                                    <span className="choice-text">{choice.text}</span>
                                </button>

                                {showFeedback && (selectedChoice === index || choice.is_correct) && (
                                    <div className={`choice-explanation ${choice.is_correct ? 'correct' : 'incorrect'}`}>
                                        <p>{choice.explanation}</p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {showFeedback && (
                    <div className="overall-explanation glass-card">
                        <h3>Overall Explanation</h3>
                        <p>{question.explanation}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuestionCard;
