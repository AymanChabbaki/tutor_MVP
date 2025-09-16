import React from 'react';
import { 
  Target, Key, BarChart3, Lightbulb, Pin, FileText, BookOpen, 
  Search, Star, Link, TestTube, Zap, Sparkles, GraduationCap,
  CheckCircle, HelpCircle, Globe, Flag
} from 'lucide-react';
import TextPostProcessor from './TextPostProcessor';

const ContentRenderer = ({ content, actionType, language }) => {
  const renderSummary = (data) => {
    if (typeof data === 'string') {
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <FileText size={20} />
              Summary
            </h3>
          </div>
          <div className="p-6">
            <TextPostProcessor 
              text={data}
              className="text-gray-700 leading-relaxed prose prose-blue max-w-none"
            />
          </div>
        </div>
      );
    }
    
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText size={20} />
          Summary
        </h3>
        <div className="text-gray-700 leading-relaxed">
          {data.summary || data.message || JSON.stringify(data)}
        </div>
      </div>
    );
  };

  const renderExplanation = (data) => {
    if (typeof data === 'string') {
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <BookOpen size={20} />
              Explanation
            </h3>
          </div>
          <div className="p-6">
            <TextPostProcessor 
              text={data}
              className="text-gray-700 leading-relaxed prose prose-green max-w-none"
            />
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <BookOpen size={20} />
            Explanation
          </h3>
        </div>
        <div className="divide-y divide-gray-200">
          {data.english_explanation && (
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <Globe size={14} />
                  English
                </span>
              </div>
              <TextPostProcessor 
                text={data.english_explanation}
                className="text-gray-700 leading-relaxed prose prose-blue max-w-none"
              />
            </div>
          )}
          
          {data.arabic_explanation && (
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4 justify-end">
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <Flag size={14} />
                  العربية
                </span>
              </div>
              <TextPostProcessor 
                text={data.arabic_explanation}
                className="text-gray-700 leading-relaxed prose prose-green max-w-none"
              />
            </div>
          )}
          
          {!data.english_explanation && !data.arabic_explanation && (
            <div className="p-6">
              <div className="text-gray-700 leading-relaxed prose prose-green max-w-none">
                {data.explanation || data.message || JSON.stringify(data)}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderExercises = (data) => {
    if (typeof data === 'string') {
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <BookOpen size={20} />
              Practice Exercises
            </h3>
          </div>
          <div className="p-6">
            <TextPostProcessor 
              text={data}
              className="text-gray-700 leading-relaxed prose prose-purple max-w-none"
            />
          </div>
        </div>
      );
    }

    const exercises = data.exercises || data.data || [];
    
    if (Array.isArray(exercises) && exercises.length > 0) {
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              � Practice Exercises
            </h3>
            <p className="text-purple-100 text-sm mt-1">Test your understanding with these exercises</p>
          </div>
          
          <div className="p-6 space-y-6">
            {exercises.map((exercise, index) => {
              const difficultyColor = {
                'Basic': 'bg-green-100 text-green-800 border-green-200',
                'Medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
                'Advanced': 'bg-red-100 text-red-800 border-red-200'
              };
              
              const difficultyIcons = {
                'Basic': '🟢',
                'Medium': '🟡',
                'Advanced': '🔴'
              };
              
              return (
                <div key={index} className="border border-gray-200 rounded-lg p-5 bg-gray-50 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="bg-purple-600 text-white text-sm font-bold px-3 py-1 rounded-full">
                        Exercise {index + 1}
                      </span>
                      {exercise.difficulty && (
                        <span className={`text-xs font-medium px-2 py-1 rounded-full border ${difficultyColor[exercise.difficulty] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                          {difficultyIcons[exercise.difficulty] || '⚪'} {exercise.difficulty}
                        </span>
                      )}
                    </div>
                    {exercise.type && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {exercise.type}
                      </span>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <HelpCircle size={16} />
                      Question:
                    </h4>
                    <div className="text-gray-700 leading-relaxed p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400 prose prose-blue max-w-none">
                      <TextPostProcessor 
                        text={exercise.question || ''}
                        className=""
                      />
                    </div>
                  </div>
                  
                  {exercise.options && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <FileText size={16} />
                        Options:
                      </h4>
                      <div className="space-y-2">
                        {exercise.options.map((option, optIndex) => (
                          <div key={optIndex} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                            <span className="font-mono text-sm bg-gray-200 w-6 h-6 rounded-full flex items-center justify-center">
                              {String.fromCharCode(65 + optIndex)}
                            </span>
                            <span className="text-gray-700">{option}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <CheckCircle size={16} />
                      Answer:
                    </h4>
                    <div className="text-gray-700 leading-relaxed bg-green-50 p-4 rounded-lg border-l-4 border-green-400 prose prose-green max-w-none">
                      <TextPostProcessor 
                        text={exercise.answer || ''}
                        className=""
                      />
                    </div>
                  </div>
                  
                  {exercise.explanation && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Lightbulb size={16} />
                        Explanation:
                      </h4>
                      <div className="text-gray-600 text-sm leading-relaxed bg-yellow-50 p-3 rounded-lg prose prose-yellow max-w-none">
                        <TextPostProcessor 
                          text={exercise.explanation}
                          className=""
                        />
                      </div>
                    </div>
                  )}
                  
                  {exercise.tips && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <h5 className="font-medium text-blue-900 mb-1 flex items-center gap-2">
                        <Target size={16} />
                        Learning Tips:
                      </h5>
                      <div className="text-blue-700 text-sm prose prose-blue max-w-none">
                        <TextPostProcessor 
                          text={exercise.tips}
                          className=""
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    
    // Fallback for string format
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <BookOpen size={20} />
            Practice Exercises
          </h3>
        </div>
        <div className="p-6">
          <TextPostProcessor 
            text={data.exercises || data.message || JSON.stringify(data)}
            className="text-gray-700 leading-relaxed prose prose-purple max-w-none"
          />
        </div>
      </div>
    );
  };

  // Main render logic
  switch (actionType) {
    case 'summary':
      return renderSummary(content);
    case 'explanation':
      return renderExplanation(content);
    case 'exercises':
      return renderExercises(content);
    default:
      return (
        <div className="text-gray-700 leading-relaxed">
          {typeof content === 'string' ? content : JSON.stringify(content)}
        </div>
      );
  }
};

export default ContentRenderer;