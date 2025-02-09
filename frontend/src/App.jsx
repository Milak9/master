import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/Home';
import SequencingVisualizer from './pages/BranchAndBound';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/branch_and_bound" element={<SequencingVisualizer />} />
      </Routes>
    </Router>
  );
}

export default App;
