import { useState } from 'react';
import type { Question, QuizMode } from './types';
import ConfigScreen from './components/ConfigScreen';
import QuizRunner from './components/QuizRunner';
import ResultSummary from './components/ResultSummary';
import { filterQuestions } from './types';
import './App.css';

type AppState = 'config' | 'quiz' | 'result';

function App() {
  const [appState, setAppState] = useState<AppState>('config');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [mode, setMode] = useState<QuizMode>('learning');
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);

  const handleStartQuiz = (allQuestions: Question[], selectedMode: QuizMode, count: number) => {
    const filtered = filterQuestions(allQuestions, count);
    setQuestions(filtered);
    setMode(selectedMode);
    setAppState('quiz');
  };

  const handleFinishQuiz = (answers: (number | null)[]) => {
    setUserAnswers(answers);
    setAppState('result');
  };

  const handleRestart = () => {
    setAppState('config');
    setQuestions([]);
    setUserAnswers([]);
  };

  return (
    <div className="app-container">
      {appState === 'config' && (
        <ConfigScreen onStart={handleStartQuiz} />
      )}

      {appState === 'quiz' && (
        <QuizRunner
          questions={questions}
          mode={mode}
          onFinish={handleFinishQuiz}
        />
      )}

      {appState === 'result' && (
        <ResultSummary
          questions={questions}
          userAnswers={userAnswers}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}

export default App;
