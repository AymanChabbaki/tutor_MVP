import React from 'react';

const ExercisesResult = ({ exercises = [] }) => (
  <div className="result-card">
    <div className="result-title">🎯 <span style={{ marginLeft: '.5rem' }}>Practice Exercises</span></div>
    <div style={{ marginTop: '.5rem' }}>
      {exercises.map((exercise, index) => (
        <div key={index} className="exercise-item">
          <div style={{ marginBottom: '.5rem' }}>
            <strong style={{ color: '#2563eb' }}>Q{index + 1}:</strong>
            <span style={{ marginLeft: '.5rem' }}>{exercise.question}</span>
          </div>
          <div style={{ color: '#065f46' }}>
            <strong>A:</strong>
            <span style={{ marginLeft: '.5rem' }}>{exercise.answer}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default ExercisesResult;
