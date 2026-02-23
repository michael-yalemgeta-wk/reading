import React, { useState } from 'react';
import './ResultSummary.css';
import type { Question } from '../types';

interface ResultSummaryProps {
    questions: Question[];
    userAnswers: (number | null)[];
    onRestart: () => void;
}

const ResultSummary: React.FC<ResultSummaryProps> = ({
    questions,
    userAnswers,
    onRestart,
}) => {
    const [copiedAll, setCopiedAll] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const correctCount: number = userAnswers.reduce<number>((acc, answer, index) => {
        return acc + (answer !== null && questions[index].choices[answer].is_correct ? 1 : 0);
    }, 0);

    const percentage = Math.round((correctCount / questions.length) * 100);

    const formatAllResultsForAI = () => {
        let text = `Quiz Results:\nScore: ${correctCount} / ${questions.length} (${percentage}%)\n\n`;
        questions.forEach((q, i) => {
            const ans = userAnswers[i];
            const isCorrect = ans !== null && q.choices[ans].is_correct;
            const userChoiceText = ans !== null ? q.choices[ans].text : 'Skipped';
            const correctChoiceText = q.choices.find(c => c.is_correct)?.text || 'Unknown';

            text += `Question ${i + 1}: ${q.question}\n`;
            text += `Status: ${isCorrect ? 'Correct' : 'Incorrect'}\n`;
            text += `User Answer: ${userChoiceText}\n`;
            if (!isCorrect) text += `Correct Answer: ${correctChoiceText}\n`;
            text += `Explanation: ${q.explanation || 'None provided'}\n\n`;
        });
        text += "Please analyze these results and tell me what areas I need to study more.";
        return text;
    };

    const formatSingleQuestionForAI = (q: Question, userAnswerIndex: number | null) => {
        const isCorrect = userAnswerIndex !== null && q.choices[userAnswerIndex].is_correct;
        const userChoiceText = userAnswerIndex !== null ? q.choices[userAnswerIndex].text : 'Skipped';
        const correctChoiceText = q.choices.find(c => c.is_correct)?.text || 'Unknown';

        return `I just answered a quiz question and got it ${isCorrect ? 'correct' : 'wrong'}.
Question: ${q.question}
My Answer: ${userChoiceText}
Correct Answer: ${correctChoiceText}
Explanation given: ${q.explanation || 'None provided'}

Can you explain this concept in more detail for me?`;
    };

    const handleCopyAll = () => {
        navigator.clipboard.writeText(formatAllResultsForAI());
        setCopiedAll(true);
        setTimeout(() => setCopiedAll(false), 2000);
    };

    const handleCopySingle = (q: Question, index: number, userAnswerIndex: number | null) => {
        navigator.clipboard.writeText(formatSingleQuestionForAI(q, userAnswerIndex));
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    return (
        <div className="result-summary fade-in">
            <div className="summary-header glass-card">
                <h1>Quiz Complete!</h1>
                <div className="score-circle">
                    <span className="score-value">{percentage}%</span>
                    <span className="score-label">{correctCount} / {questions.length} Correct</span>
                </div>
                <div className="summary-actions">
                    <button className="btn-primary restart-btn" onClick={onRestart}>
                        Take Another Quiz
                    </button>
                    <button className="btn-secondary copy-btn" onClick={handleCopyAll}>
                        {copiedAll ? '✓ Copied Results!' : '📋 Copy All Results for AI Analysis'}
                    </button>
                </div>
            </div>

            <div className="review-section">
                <h2>Review Answers</h2>
                <div className="questions-review">
                    {questions.map((q, index) => {
                        const userAnswer = userAnswers[index];
                        const isCorrect = userAnswer !== null && q.choices[userAnswer].is_correct;

                        return (
                            <div key={index} className={`review-card glass-card ${isCorrect ? 'correct' : 'incorrect'}`}>
                                <div className="review-status">
                                    <div className="status-left">
                                        <span className={`status-badge ${isCorrect ? 'correct' : 'incorrect'}`}>
                                            {isCorrect ? 'Correct' : 'Incorrect'}
                                        </span>
                                        <h3>Question {index + 1}</h3>
                                    </div>
                                    <button
                                        className="btn-ghost small copy-q-btn"
                                        onClick={() => handleCopySingle(q, index, userAnswer)}
                                    >
                                        {copiedIndex === index ? '✓ Copied!' : '🤖 Ask AI to Explain'}
                                    </button>
                                </div>
                                <p className="question-text">{q.question}</p>

                                <div className="answer-grid">
                                    <div className="answer-box">
                                        <span className="label">Your Answer:</span>
                                        <span className="value">
                                            {userAnswer !== null ? q.choices[userAnswer].text : 'Skipped'}
                                        </span>
                                    </div>
                                    {!isCorrect && q.choices.find(c => c.is_correct) && (
                                        <div className="answer-box correct">
                                            <span className="label">Correct Answer:</span>
                                            <span className="value">
                                                {q.choices.find(c => c.is_correct)?.text}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="explanation-box">
                                    <h4>Explanation</h4>
                                    <p>{q.explanation}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ResultSummary;
