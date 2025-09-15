import React from 'react';

const features = [
  {
    id: 'summarize',
    title: 'Summarize',
    description: 'Get a concise summary',
    icon: '📝'
  },
  {
    id: 'explain',
    title: 'Explain',
    description: 'Detailed explanation in Arabic & English',
    icon: '🗣️'
  },
  {
    id: 'exercises',
    title: 'Generate Exercises',
    description: 'Practice questions and answers',
    icon: '🎯'
  }
];

const FeatureSelector = ({ selectedFeature, onFeatureChange }) => (
  <div className="feature-selector">
    {features.map(feature => (
      <button
        key={feature.id}
        onClick={() => onFeatureChange(feature.id)}
        aria-pressed={selectedFeature === feature.id}
        className={`feature-card${selectedFeature === feature.id ? ' feature-card--active' : ''}`}
        type="button"
      >
        <div className="feature-icon">{feature.icon}</div>
        <div className="feature-title">{feature.title}</div>
        <div className="feature-desc">{feature.description}</div>
      </button>
    ))}
  </div>
);

export default FeatureSelector;
