import React from 'react';

const ExplanationResult = ({ arabicExplanation = '', englishExplanation = '' }) => (
  <div className="result-card" role="region" aria-label="Detailed Explanation">
    <div className="result-title">🗣️ <span style={{ marginLeft: '.5rem' }}>Detailed Explanation</span></div>

    <div style={{ marginTop: '.5rem' }}>
      <h4 style={{ fontWeight: 600, marginBottom: '.25rem' }}>الشرح بالعربية</h4>
      <p className="rtl" style={{ color: '#374151', lineHeight: 1.6 }}>{arabicExplanation}</p>
    </div>

    <div style={{ marginTop: '.75rem' }}>
      <h4 style={{ fontWeight: 600, marginBottom: '.25rem' }}>English Explanation</h4>
      <p style={{ color: '#374151', lineHeight: 1.6 }}>{englishExplanation}</p>
    </div>
  </div>
);

export default ExplanationResult;
