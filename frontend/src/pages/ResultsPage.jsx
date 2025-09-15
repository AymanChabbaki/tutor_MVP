import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';

const ResultsPage = ({ results }) => {
  const navigate = useNavigate();

  if (!results) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-4">No results to display</div>
          <Button onClick={() => navigate('/')} variant="primary">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    console.log('Content copied to clipboard');
  };

  const renderExplanation = (data) => {
    if (data.explanation) {
      return (
        <Card
          title="Detailed Explanation"
          showCopyButton={true}
          copyText={data.explanation}
          onCopy={() => handleCopy(data.explanation)}
        >
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {data.explanation}
            </p>
            {data.language && (
              <div className="mt-4 text-xs text-gray-500">
                Language: {data.language === 'arabic' ? 'Arabic' : 'English'}
              </div>
            )}
          </div>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {data.arabic_explanation && (
          <Card
            title="Arabic Explanation"
            showCopyButton={true}
            copyText={data.arabic_explanation}
            onCopy={() => handleCopy(data.arabic_explanation)}
          >
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-right" dir="rtl">
                {data.arabic_explanation}
              </p>
            </div>
          </Card>
        )}
        
        {data.english_explanation && (
          <Card
            title="English Explanation"
            showCopyButton={true}
            copyText={data.english_explanation}
            onCopy={() => handleCopy(data.english_explanation)}
          >
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {data.english_explanation}
              </p>
            </div>
          </Card>
        )}
      </div>
    );
  };

  const renderExercises = (data) => {
    const exercises = data.exercises || [];
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Practice Exercises</h2>
          {data.language && (
            <span className="text-xs text-gray-500">
              Language: {data.language === 'arabic' ? 'Arabic' : 'English'}
            </span>
          )}
        </div>
        
        {exercises.length > 0 ? (
          exercises.map((exercise, index) => (
            <Card
              key={index}
              title={`Exercise ${index + 1}`}
              showCopyButton={true}
              copyText={`Q: ${exercise.question}\n\nA: ${exercise.answer}`}
              onCopy={() => handleCopy(`Q: ${exercise.question}\n\nA: ${exercise.answer}`)}
            >
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-blue-700 mb-2">Question:</h4>
                  <p className="text-gray-700 leading-relaxed">
                    {exercise.question}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-green-700 mb-2">Answer:</h4>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {exercise.answer}
                  </p>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card>
            <div className="text-center py-8 text-gray-500">
              No exercises were generated. Please try again.
            </div>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {results.type === 'explanation' ? 'Explanation' : 'Exercises'}
        </h1>
        <Button
          onClick={() => navigate('/')}
          variant="outline"
          size="small"
        >
          Back to Home
        </Button>
      </div>

      {results.type === 'explanation' && renderExplanation(results.data)}
      {results.type === 'exercises' && renderExercises(results.data)}
    </div>
  );
};

export default ResultsPage;