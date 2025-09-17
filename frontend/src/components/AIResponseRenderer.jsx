import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Button from './Button_v2';

// Arabic character regex for RTL detection
const ARABIC_REGEX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

const AIResponseRenderer = ({ 
  content, 
  type = 'text',
  language = 'auto',
  showCopyButton = true,
  className = '' 
}) => {
  const [copied, setCopied] = useState(false);

  // Detect if content contains Arabic text
  const containsArabic = (text) => {
    return ARABIC_REGEX.test(text);
  };

  // Auto-detect language if not specified
  const detectLanguage = (text) => {
    if (language !== 'auto') return language;
    return containsArabic(text) ? 'arabic' : 'english';
  };

  // Copy content to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Get appropriate styling based on detected language
  const getTextStyling = (text) => {
    const detectedLang = detectLanguage(text);
    const isRTL = detectedLang === 'arabic';
    
    return {
      direction: isRTL ? 'rtl' : 'ltr',
      textAlign: isRTL ? 'right' : 'left',
      fontFamily: isRTL ? "'Tajawal', 'Arial', sans-serif" : "'Inter', 'Arial', sans-serif",
      className: isRTL ? 'text-right' : 'text-left'
    };
  };

  if (!content) {
    return null;
  }

  const textStyling = getTextStyling(content);

  return (
    <div className={`relative ${className}`}>
      {showCopyButton && (
        <div className="absolute top-2 right-2 z-10">
          <Button
            size="small"
            variant="ghost"
            onClick={copyToClipboard}
            className="bg-white/80 backdrop-blur-sm shadow-sm"
            title="Copy to clipboard"
          >
            {copied ? (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </Button>
        </div>
      )}

      <div 
        style={{
          direction: textStyling.direction,
          fontFamily: textStyling.fontFamily
        }}
        className={`prose max-w-none ${textStyling.className}`}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // Custom components for better styling
            h1: ({ children }) => (
              <h1 className="text-2xl font-bold mb-4 text-gray-900" style={{ textAlign: textStyling.textAlign }}>
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-xl font-semibold mb-3 text-gray-900" style={{ textAlign: textStyling.textAlign }}>
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-lg font-medium mb-2 text-gray-900" style={{ textAlign: textStyling.textAlign }}>
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className="mb-3 text-gray-700 leading-relaxed" style={{ textAlign: textStyling.textAlign }}>
                {children}
              </p>
            ),
            ul: ({ children }) => (
              <ul className="list-disc list-inside mb-3 space-y-1 text-gray-700" style={{ textAlign: textStyling.textAlign }}>
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-inside mb-3 space-y-1 text-gray-700" style={{ textAlign: textStyling.textAlign }}>
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="text-gray-700" style={{ textAlign: textStyling.textAlign }}>
                {children}
              </li>
            ),
            strong: ({ children }) => (
              <strong className="font-semibold text-gray-900">{children}</strong>
            ),
            em: ({ children }) => (
              <em className="italic text-gray-800">{children}</em>
            ),
            code: ({ children, inline }) => 
              inline ? (
                <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono text-gray-800">
                  {children}
                </code>
              ) : (
                <code className="block bg-gray-100 p-3 rounded-md text-sm font-mono text-gray-800 overflow-x-auto">
                  {children}
                </code>
              ),
            blockquote: ({ children }) => (
              <blockquote 
                className="border-l-4 border-blue-400 pl-4 py-2 mb-3 bg-blue-50 text-gray-700"
                style={{ textAlign: textStyling.textAlign }}
              >
                {children}
              </blockquote>
            )
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
};

// Exercise renderer component
export const ExerciseRenderer = ({ exercises, className = '' }) => {
  if (!exercises || !Array.isArray(exercises)) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {exercises.map((exercise, index) => (
        <ExerciseCard key={index} exercise={exercise} index={index + 1} />
      ))}
    </div>
  );
};

const ExerciseCard = ({ exercise, index }) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyExercise = async () => {
    try {
      const text = `Question ${index}: ${exercise.question}\nAnswer: ${exercise.answer}`;
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy exercise: ', err);
    }
  };

  const questionStyling = getTextStyling(exercise.question);
  const answerStyling = getTextStyling(exercise.answer);

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <h4 className="text-lg font-medium text-gray-900">Question {index}</h4>
        <Button
          size="small"
          variant="ghost"
          onClick={copyExercise}
          title="Copy exercise"
        >
          {copied ? (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 002 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </Button>
      </div>

      <div 
        style={{
          direction: questionStyling.direction,
          textAlign: questionStyling.textAlign,
          fontFamily: questionStyling.fontFamily
        }}
        className="mb-3"
      >
        <AIResponseRenderer 
          content={exercise.question} 
          showCopyButton={false}
          className="text-gray-700"
        />
      </div>

      <Button
        size="small"
        variant="outline"
        onClick={() => setShowAnswer(!showAnswer)}
        className="mb-3"
      >
        {showAnswer ? 'Hide Answer' : 'Show Answer'}
      </Button>

      {showAnswer && (
        <div 
          style={{
            direction: answerStyling.direction,
            textAlign: answerStyling.textAlign,
            fontFamily: answerStyling.fontFamily
          }}
          className="bg-green-50 p-3 rounded-md border border-green-200"
        >
          <AIResponseRenderer 
            content={exercise.answer} 
            showCopyButton={false}
            className="text-green-800"
          />
        </div>
      )}
    </div>
  );
};

// Helper function for text styling (shared)
const getTextStyling = (text) => {
  const ARABIC_REGEX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  const containsArabic = ARABIC_REGEX.test(text);
  
  return {
    direction: containsArabic ? 'rtl' : 'ltr',
    textAlign: containsArabic ? 'right' : 'left',
    fontFamily: containsArabic ? "'Tajawal', 'Arial', sans-serif" : "'Inter', 'Arial', sans-serif"
  };
};

export default AIResponseRenderer;