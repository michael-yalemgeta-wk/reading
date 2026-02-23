import React, { useState, useRef, useEffect } from 'react';
import './ConfigScreen.css';
import type { QuizMode, Question } from '../types';
import { validateQuestionsJSON } from '../utils/validation';

interface ConfigScreenProps {
    onStart: (questions: Question[], mode: QuizMode, count: number) => void;
}

const ConfigScreen: React.FC<ConfigScreenProps> = ({ onStart }) => {
    const [jsonInput, setJsonInput] = useState(() => {
        return localStorage.getItem('quiz_json_input') || '';
    });
    const [mode, setMode] = useState<QuizMode>('learning');
    const [count, setCount] = useState(5);
    const [errors, setErrors] = useState<string[]>([]);
    const [copiedPrompt, setCopiedPrompt] = useState(false);
    const [copiedError, setCopiedError] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        localStorage.setItem('quiz_json_input', jsonInput);
    }, [jsonInput]);

    const handleStart = () => {
        setErrors([]);
        try {
            const parsed = JSON.parse(jsonInput);
            const validation = validateQuestionsJSON(parsed);

            if (validation.isValid) {
                onStart(validation.data, mode, count);
            } else {
                setErrors(validation.errors);
                try {
                    setJsonInput(JSON.stringify(parsed, null, 2));
                } catch (e) { }
            }
        } catch (err: any) {
            setErrors([err.message || 'Invalid JSON format.']);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            setJsonInput(content);
            setErrors([]);
        };
        reader.readAsText(file);
    };

    const handleCopyPrompt = () => {
        const promptText = `Please convert the following text/knowledge into a JSON array of quiz questions. The JSON must exactly match this structure:
[
  {
    "id": "unique-id-1",
    "question": "The question text?",
    "background_knowledge": "Helpful context to read before answering.",
    "explanation": "Why the correct answer is correct.",
    "choices": [
      {
        "text": "First choice",
        "is_correct": true,
        "explanation": "Explanation for this choice"
      },
      {
        "text": "Second choice",
        "is_correct": false,
        "explanation": "Explanation for this choice"
      }
    ]
  }
]

Here is the text to convert: `;
        navigator.clipboard.writeText(promptText);
        setCopiedPrompt(true);
        setTimeout(() => setCopiedPrompt(false), 2000);
    };

    const handleCopyError = () => {
        const errorText = `I have the following JSON for a quiz app:\n\`\`\`json\n${jsonInput}\n\`\`\`\n\nBut I am getting these validation errors:\n${errors.map((e, i) => `${i + 1}. ${e}`).join('\n')}\n\nCan you fix the JSON for me?`;
        navigator.clipboard.writeText(errorText);
        setCopiedError(true);
        setTimeout(() => setCopiedError(false), 2000);
    };

    const handleHighlightError = (errorMsg: string) => {
        const match = errorMsg.match(/index (\d+)|question (\d+)/);
        if (match) {
            const idx = parseInt(match[1] || match[2], 10);
            if (!isNaN(idx) && textareaRef.current && jsonInput) {
                try {
                    const parsed = JSON.parse(jsonInput);
                    let builtString = '[\n';
                    let startPos = -1;
                    let endPos = -1;

                    for (let i = 0; i < parsed.length; i++) {
                        const itemStr = JSON.stringify(parsed[i], null, 2).split('\n').map(line => '  ' + line).join('\n');

                        if (i === idx) {
                            startPos = builtString.length;
                            endPos = startPos + itemStr.length;
                        }

                        builtString += itemStr;
                        if (i < parsed.length - 1) {
                            builtString += ',\n';
                        } else {
                            builtString += '\n';
                        }
                    }
                    builtString += ']';

                    if (startPos !== -1) {
                        setJsonInput(builtString);
                        setTimeout(() => {
                            if (textareaRef.current) {
                                textareaRef.current.focus();
                                textareaRef.current.setSelectionRange(startPos, endPos);
                            }
                        }, 10);
                    }
                } catch (e) { }
            }
        }
    };

    return (
        <div className="config-screen fade-in">
            <div className="glass-card main-config">
                <h1 className="title">Quiz Config</h1>
                <p className="subtitle">Upload or paste your questions in JSON format to begin.</p>

                <div className="input-group">
                    <label>Question Data (JSON)</label>
                    <textarea
                        ref={textareaRef}
                        placeholder="Paste JSON here..."
                        value={jsonInput}
                        onChange={(e) => setJsonInput(e.target.value)}
                        className="json-textarea"
                    />
                    <div className="file-upload">
                        <span>Or upload a file:</span>
                        <input type="file" accept=".json" onChange={handleFileUpload} />
                        {jsonInput && (
                            <button className="btn-ghost small" onClick={() => { setJsonInput(''); setErrors([]); }}>
                                🗑️ Clear Input
                            </button>
                        )}
                    </div>
                </div>

                {errors.length > 0 && (
                    <div className="error-message">
                        <div className="error-header">
                            <strong>Validation Failed:</strong>
                            <button className="btn-ghost small copy-error-btn" onClick={handleCopyError}>
                                {copiedError ? '✓ Copied for AI' : '🤖 Ask AI to Fix Errors'}
                            </button>
                        </div>
                        <ul>
                            {errors.map((err, i) => (
                                <li key={i} className="clickable-error" onClick={() => handleHighlightError(err)}>
                                    {err}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="settings-row">
                    <div className="setting-item">
                        <label>Mode</label>
                        <div className="mode-toggle">
                            <button
                                className={mode === 'learning' ? 'active' : ''}
                                onClick={() => setMode('learning')}
                            >
                                Learning
                            </button>
                            <button
                                className={mode === 'test' ? 'active' : ''}
                                onClick={() => setMode('test')}
                            >
                                Test
                            </button>
                        </div>
                    </div>

                    <div className="setting-item">
                        <label>Number of Questions</label>
                        <input
                            type="number"
                            min="1"
                            value={count}
                            onChange={(e) => setCount(Number(e.target.value))}
                            className="count-input"
                        />
                    </div>
                </div>

                <button
                    className="btn-primary start-button"
                    onClick={handleStart}
                    disabled={!jsonInput.trim()}
                >
                    Start Quiz
                </button>
            </div>

            <div className="helpers-section">
                <div className="helper-card glass-card">
                    <div className="helper-header">
                        <h3>🤖 AI Prompt Helper</h3>
                        <button className="btn-ghost small copy-prompt-btn" onClick={handleCopyPrompt}>
                            {copiedPrompt ? '✓ Copied Prompt' : '📋 Copy Prompt'}
                        </button>
                    </div>
                    <p>Copy this prompt and provide it to any AI (like ChatGPT or Gemini) along with your text to instantly generate valid quiz JSON:</p>
                    <textarea
                        className="prompt-box"
                        readOnly
                        value={`Please convert the following text/knowledge into a JSON array of quiz questions. The JSON must exactly match this structure:
[
  {
    "id": "unique-id-1",
    "question": "The question text?",
    "background_knowledge": "Helpful context to read before answering.",
    "explanation": "Why the correct answer is correct.",
    "choices": [
      {
        "text": "First choice",
        "is_correct": true,
        "explanation": "Explanation for this choice"
      },
      {
        "text": "Second choice",
        "is_correct": false,
        "explanation": "Explanation for this choice"
      }
    ]
  }
]

Here is the text to convert: `}
                    />
                </div>

                <div className="helper-card glass-card">
                    <h3>📄 Expected JSON Format</h3>
                    <pre className="json-format-box">{`[
  {
    "id": "q1",
    "question": "What is a Firewall?",
    "background_knowledge": "A firewall is a network security device...",
    "explanation": "Firewalls use rules to block unauthorized access.",
    "choices": [
      {
        "text": "A barrier blocking unauthorized networks",
        "is_correct": true,
        "explanation": "Correct because it filters traffic."
      }
    ]
  }
]`}</pre>
                </div>
            </div>
        </div>
    );
};

export default ConfigScreen;
