import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import './index.css';

const LS_ANSWERS_KEY = 'mcq_selectedAnswers';
const LS_SUBMITTED_KEY = 'mcq_submitted';

export default function MCQQuiz() {
  const [mcqs, setMcqs] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState(() => {
    // Load saved answers from localStorage or empty object
    try {
      const saved = localStorage.getItem(LS_ANSWERS_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [submitted, setSubmitted] = useState(() => {
    // Load saved submit state from localStorage or false
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
    axios.get('/api/mcqs')
      .then(res => setMcqs(res.data.mcqs))
      .catch(console.error);
  }, []);

  // Save answers to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(LS_ANSWERS_KEY, JSON.stringify(selectedAnswers));
    } catch {}
  }, [selectedAnswers]);

  // Save submitted state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(LS_SUBMITTED_KEY, submitted.toString());
    } catch {}
  }, [submitted]);

  const handleSelect = (index, option) => {
    if (!submitted) {
      setSelectedAnswers(prev => ({ ...prev, [index]: option }));
    }
  };

  const handleSubmit = () => setSubmitted(true);

  const scrollToQuestion = index => {
    setCurrentQuestionIndex(index);
    const el = document.getElementById(`question-${index}`);
    if (el && mainRef.current) {
      mainRef.current.scrollTo({ top: el.offsetTop, behavior: 'smooth' });
    }
  };

  const totalAnswered = Object.keys(selectedAnswers).length;
  const correctCount = mcqs.reduce(
    (acc, mcq, i) => acc + (selectedAnswers[i] === mcq.answer ? 1 : 0),
    0
  );

  return (
    <div className="mcq-container">
      {/* Main Heading */}
      <h1
        style={{
          textAlign: 'center',
          margin: '1rem 0',
          fontSize: '2rem',
          fontWeight: '700',
          color: '#1e40af',
        }}
      >
        Digital Marketing MCQ Quiz
      </h1>

      {/* Sidebar */}
      <nav className="mcq-sidebar" aria-label="Question navigation">
        <h2>Questions</h2>
        <ul>
          {mcqs.map((_, i) => {
            const answered = selectedAnswers.hasOwnProperty(i);
            const isActive = i === currentQuestionIndex;
            return (
              <li
                key={i}
                className={`${isActive ? 'active' : ''}`}
                onClick={() => scrollToQuestion(i)}
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === 'Enter') scrollToQuestion(i);
                }}
                aria-current={isActive ? 'true' : 'false'}
              >
                {i + 1}
                <span
                  className={`status ${answered ? 'answered' : 'unanswered'}`}
                  aria-label={answered ? 'Answered' : 'Unanswered'}
                >
                  {answered ? '✓' : '✗'}
                </span>
              </li>
            );
          })}
        </ul>
        {submitted && (
          <div
            className="score-display"
            aria-live="polite"
            style={{ marginTop: 'auto', textAlign: 'center' }}
          >
            Score: {correctCount} / {mcqs.length}
          </div>
        )}
      </nav>

      {/* Main content */}
      <main className="mcq-main" ref={mainRef} tabIndex={-1} aria-live="polite">
        {mcqs.map((mcq, i) => {
          const userAnswer = selectedAnswers[i];
          const isCorrect = userAnswer === mcq.answer;
          let questionClass = 'mcq-question';

          if (submitted) {
            if (userAnswer == null) questionClass += ' unanswered';
            else if (isCorrect) questionClass += ' correct';
            else questionClass += ' incorrect';
          }

          return (
            <section
              id={`question-${i}`}
              key={i}
              className={questionClass}
              tabIndex={-1}
              aria-labelledby={`question-label-${i}`}
            >
              <p id={`question-label-${i}`}>
                {i + 1}. {mcq.question}
              </p>
              <div className="mcq-options">
                {Object.entries(mcq.options).map(([key, text]) => {
                  const isSelected = userAnswer === key;
                  return (
                    <label
                      key={key}
                      className={`${isSelected ? 'selected' : ''} ${
                        submitted
                          ? key === mcq.answer
                            ? 'correct'
                            : isSelected
                            ? 'incorrect'
                            : 'disabled'
                          : ''
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${i}`}
                        value={key}
                        checked={isSelected}
                        disabled={submitted}
                        onChange={() => handleSelect(i, key)}
                        aria-checked={isSelected}
                      />
                      <strong>{key}.</strong> {text}
                    </label>
                  );
                })}
              </div>
            </section>
          );
        })}
      </main>

      {/* Submit button */}
      <div className="submit-container">
        {!submitted ? (
          <>
            <div>
              Answered: {totalAnswered} / {mcqs.length}
            </div>
            <button
              onClick={handleSubmit}
              disabled={totalAnswered === 0}
              aria-disabled={totalAnswered === 0}
            >
              Submit
            </button>
          </>
        ) : (
          <div className="score-display" aria-live="polite">
            Your final score is {correctCount} out of {mcqs.length}
          </div>
        )}
      </div>
    </div>
  );
}
