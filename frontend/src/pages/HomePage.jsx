import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import LanguageSelector from '../components/LanguageSelector';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';
import { postSummary, postExplanation, postExercises } from '../services/api';

const HomePage = ({ 
  onSummaryGenerated, 
  onExplanationGenerated,
  onExercisesGenerated,
  onResultsGenerated,
  setSidebarOpen 
}) => {
  const [text, setText] = useState('');
  const [language, setLanguage] = useState('english');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleTextChange = (e) => {
    setText(e.target.value);
    if (error) setError(null);
  };

  const handleSubmit = async (action) => {
    if (!text.trim()) {
      setError('Please enter some course content to proceed.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let result;
      
      if (action === 'summary') {
        result = await postSummary(text, language);
        const summaryContent = result.summary || result.message;
        onSummaryGenerated(text, summaryContent, language);
        setSidebarOpen(true);
      } else if (action === 'explanation') {
        result = await postExplanation(text, language);
        // Handle both single language and bilingual responses
        let explanationContent;
        if (language === 'both') {
          explanationContent = {
            english: result.english_explanation,
            arabic: result.arabic_explanation
          };
        } else if (language === 'arabic') {
          explanationContent = result.arabic_explanation || result.explanation;
        } else {
          explanationContent = result.english_explanation || result.explanation;
        }
        
        onExplanationGenerated(text, explanationContent, language);
        onResultsGenerated({
          type: 'explanation',
          data: result
        });
        navigate('/results');
      } else if (action === 'exercises') {
        result = await postExercises(text, language);
        const exercisesContent = result.exercises || result.data || result;
        
        onExercisesGenerated(text, exercisesContent, language);
        onResultsGenerated({
          type: 'exercises',
          data: result
        });
        navigate('/results');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Spinner message="Generating content with AI..." />;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          AI Bootcamp Tutor
        </h1>
        <p className="text-gray-600">
          Paste your course content below and generate summaries, explanations, or practice exercises
        </p>
      </div>

      {error && (
        <Alert 
          type="error" 
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            Course Content
          </label>
          <textarea
            id="content"
            value={text}
            onChange={handleTextChange}
            placeholder="Paste your course content, headings, or any educational material here..."
            className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
            disabled={loading}
          />
          <div className="text-xs text-gray-500 mt-1">
            {text.length} characters
          </div>
        </div>

        <LanguageSelector 
          language={language} 
          onChange={setLanguage}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button
          onClick={() => handleSubmit('summary')}
          disabled={loading || !text.trim()}
          fullWidth
          variant="primary"
        >
          📝 Generate Summary
        </Button>
        
        <Button
          onClick={() => handleSubmit('explanation')}
          disabled={loading || !text.trim()}
          fullWidth
          variant="secondary"
        >
          🗣️ Generate Explanation
        </Button>
        
        <Button
          onClick={() => handleSubmit('exercises')}
          disabled={loading || !text.trim()}
          fullWidth
          variant="success"
        >
          🎯 Generate Exercises
        </Button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">💡 How to use:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Summary:</strong> Get a concise overview of your content (appears in sidebar)</li>
          <li>• <strong>Explanation:</strong> Get detailed explanations in your chosen language</li>
          <li>• <strong>Exercises:</strong> Generate practice questions and answers</li>
        </ul>
      </div>
    </div>
  );
};

export default HomePage;