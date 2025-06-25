import React from 'react';
import { Link } from 'react-router-dom';
import './index.css';

export default function Home() {
  return (
    <div className="home-container">
      <h1>Welcome to the Quiz Website</h1>
      <p>Select a quiz to get started:</p>
      <div className="quiz-list">
        <Link to="/swayamDM" className="quiz-card">
          <h2>MCQ-60</h2>
          <p>Digital Marketing-Swayam</p>
        </Link>
        <Link to="/geuDM" className="quiz-card">
          <h2>MCQ-200</h2>
          <p>Digital Marketing-GEU</p>
        </Link>
      </div>
    </div>
  );
}
