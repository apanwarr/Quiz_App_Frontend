import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import './index.css';

const LS_ANSWERS_KEY = 'mcq_selectedAnswers';
const LS_SUBMITTED_KEY = 'mcq_submitted';

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function MCQQuiz({ dataset }) {
  const [mcqs, setMcqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState(() => {
    try {
      const saved = localStorage.getItem(LS_ANSWERS_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [submitted, setSubmitted] = useState(() => {
    try {
      const saved = localStorage.getItem(LS_SUBMITTED_KEY);
      return saved === 'true';
    } catch {
      return false;
    }
  });

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const mainRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
      axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/mcqs/${dataset}`)
      .then(res => {
        if (res.data && Array.isArray(res.data.mcqs)) {
          const shuffled = shuffleArray(res.data.mcqs);
          setMcqs(shuffled);
        } else {
          setError('Invalid data format received from server.');
        }
      })
      .catch(err => {
        setError('Failed to fetch questions. Please try again later.');
        console.error('Error fetching MCQs:', err);
      })
      .finally(() => setLoading(false));
  }, [dataset]);

  useEffect(() => {
    localStorage.setItem(LS_ANSWERS_KEY, JSON.stringify(selectedAnswers));
  }, [selectedAnswers]);

  useEffect(() => {
    localStorage.setItem(LS_SUBMITTED_KEY, submitted.toString());
  }, [submitted]);

  const handleSelect = (index, option) => {
    if (!submitted) {
      const questionId = mcqs[index].id;
      setSelectedAnswers(prev => ({ ...prev, [questionId]: option }));
    }
  };

  const handleClearChoice = (index) => {
    const questionId = mcqs[index].id;
    setSelectedAnswers(prev => {
      const updated = { ...prev };
      delete updated[questionId];
      return updated;
    });
  };

  const handleSubmit = () => setSubmitted(true);

  const handleRestart = () => {
    setMcqs(prev => shuffleArray(prev));
    setSelectedAnswers({});
    setSubmitted(false);
    setCurrentQuestionIndex(0);
    localStorage.removeItem(LS_ANSWERS_KEY);
    localStorage.removeItem(LS_SUBMITTED_KEY);
    if (mainRef.current) mainRef.current.scrollTo({ top: 0 });
  };

  const scrollToQuestion = index => {
    setCurrentQuestionIndex(index);
    const el = document.getElementById(`question-${index}`);
    if (el && mainRef.current) {
      mainRef.current.scrollTo({ top: el.offsetTop, behavior: 'smooth' });
    }
  };

  if (loading) return <div className="loading">Loading questions... Please wait.</div>;
  if (error) return <div className="error">{error}</div>;

  const totalAnswered = Object.keys(selectedAnswers).length;
  const correctCount = mcqs.reduce((acc, mcq) => {
    const userAnswer = selectedAnswers[mcq.id];
    return userAnswer === mcq.answer ? acc + 1 : acc;
  }, 0);

  return (
    <div className="mcq-quiz-wrapper">
      {/* Top Header with Logout */}
      <header className="mcq-top-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Digital Marketing MCQ Quiz</h1>
      </header>

      {/* Layout: Sidebar + Main Questions */}
      <div className="mcq-body">
        <aside className="mcq-sidebar">
          <h2>Questions</h2>
          <ul>
            {mcqs.map((mcq, i) => {
              const answered = selectedAnswers.hasOwnProperty(mcq.id);
              const isActive = i === currentQuestionIndex;
              return (
                <li
                  key={mcq.id}
                  className={`${isActive ? 'active' : ''}`}
                  onClick={() => scrollToQuestion(i)}
                  tabIndex={0}
                  onKeyDown={e => {
                    if (e.key === 'Enter') scrollToQuestion(i);
                  }}
                >
                  {i + 1}
                  <span className={`status ${answered ? 'answered' : 'unanswered'}`}>
                    {answered ? '✓' : '✗'}
                  </span>
                </li>
              );
            })}
          </ul>
          {submitted && (
            <div className="score-display">
              Score: {correctCount} / {mcqs.length}
            </div>
          )}
        </aside>

        <main className="mcq-main" ref={mainRef}>
          {mcqs.map((mcq, i) => {
            const userAnswer = selectedAnswers[mcq.id];
            const isCorrect = userAnswer !== undefined && userAnswer === mcq.answer;

            let questionClass = 'mcq-question';
            if (submitted) {
              if (userAnswer == null) questionClass += ' unanswered';
              else if (isCorrect) questionClass += ' correct';
              else questionClass += ' incorrect';
            }

            return (
              <section
                id={`question-${i}`}
                key={mcq.id}
                className={questionClass}
                tabIndex={-1}
              >
                <div className="question-content">
                  <div className="question-text">
                    <p><strong>Q{i + 1}.</strong> {mcq.question}</p>
                  </div>
                  <div className="mcq-options">
                    {Object.entries(mcq.options).map(([key, text]) => {
                      const isSelected = userAnswer === key;

                      const optionClass = submitted && userAnswer != null
                        ? key === mcq.answer
                          ? 'correct'
                          : isSelected
                          ? 'incorrect'
                          : ''
                        : isSelected
                        ? 'selected'
                        : '';

                      return (
                        <label key={key} className={optionClass}>
                          <input
                            type="radio"
                            name={`question-${i}`}
                            value={key}
                            checked={isSelected}
                            disabled={submitted}
                            onChange={() => handleSelect(i, key)}
                          />
                          <strong>{key}.</strong> {text}
                        </label>
                      );
                    })}
                  </div>
                </div>

                {!submitted && userAnswer != null && (
                  <button className="clear-btn" onClick={() => handleClearChoice(i)}>
                    Clear Choice
                  </button>
                )}
              </section>
            );
          })}
        </main>
      </div>

      {/* Footer */}
      <footer className="submit-container">
        {!submitted ? (
          <>
            <div>Answered: {totalAnswered} / {mcqs.length}</div>
            <button
              onClick={handleSubmit}
              disabled={totalAnswered === 0}
            >
              Submit
            </button>
          </>
        ) : (
          <>
            <div className="score-display">
              Your final score is {correctCount} out of {mcqs.length}
            </div>
            <button onClick={handleRestart} className="restart-btn">
              Restart Quiz
            </button>
          </>
        )}
      </footer>
    </div>
  );
}
