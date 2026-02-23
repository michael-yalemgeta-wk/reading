import { useState, useEffect } from 'react';
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
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('quiz_theme') as 'light' | 'dark') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('quiz_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

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

  const handleQuit = () => {
    setAppState('config');
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '1rem', width: '100%', maxWidth: '780px', margin: '0 auto' }}>
        <button className="btn-ghost small" onClick={toggleTheme}>
          {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>
      <div className="app-container">
        {appState === 'config' && (
          <ConfigScreen onStart={handleStartQuiz} />
        )}

        {appState === 'quiz' && (
          <QuizRunner
            questions={questions}
            mode={mode}
            onFinish={handleFinishQuiz}
            onQuit={handleQuit}
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
    </>
  );
}

export default App;
