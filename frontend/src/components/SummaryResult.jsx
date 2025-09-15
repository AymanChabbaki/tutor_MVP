import React from 'react';

const SummaryResult = ({ summary }) => (
  <div className="result-card">
    <div className="result-title">📝 <span style={{ marginLeft: '.5rem' }}>Summary</span></div>
    <p style={{ color: '#374151', lineHeight: 1.6 }}>{summary}</p>
  </div>
);

export default SummaryResult;
