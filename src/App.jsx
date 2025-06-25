import React from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import Home from './Home';
import MCQQuiz from './MCQQuiz';

function QuizWrapper() {
  const { setName } = useParams();
  return <MCQQuiz dataset={setName} />;
}

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/:setName" element={<QuizWrapper />} />
      </Routes>
    </Router>
  );
};

export default App;
