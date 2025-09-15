import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import LanguageSelector from '../components/LanguageSelector';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';
import ContentRenderer from '../components/ContentRenderer';
import Card from '../components/Card';
import { postSummary, postExplanation, postExercises } from '../services/api';

const ChatPage = ({ 
  onSummaryGenerated, 
  onExplanationGenerated,
  onExercisesGenerated,
  onResultsGenerated,
  setSidebarOpen,
  selectedHistoryItem = null 
}) => {
  const [text, setText] = useState('');
  const [language, setLanguage] = useState('english');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [conversation, setConversation] = useState([]);
  const navigate = useNavigate();

  // Add selected history item to conversation when it changes
  React.useEffect(() => {
    if (selectedHistoryItem) {
      const newMessage = {
        id: selectedHistoryItem.id,
        type: 'history',
        originalText: selectedHistoryItem.originalText,
        content: selectedHistoryItem.content,
        language: selectedHistoryItem.language,
        messageType: selectedHistoryItem.type,
        timestamp: selectedHistoryItem.timestamp
      };
      
      setConversation(prev => {
        // Check if this item is already in the conversation
        const exists = prev.find(item => item.id === selectedHistoryItem.id);
        if (!exists) {
          return [...prev, newMessage];
        }
        return prev;
      });
    }
  }, [selectedHistoryItem]);

  const handleTextChange = (e) => {
    setText(e.target.value);
    if (error) setError(null);
  };

  const addToConversation = (type, originalText, content, language) => {
    const newMessage = {
      id: Date.now().toString(),
      type: 'generated',
      originalText,
      content,
      language,
      messageType: type,
      timestamp: new Date().toISOString()
    };
    
    setConversation(prev => [...prev, newMessage]);
    return newMessage;
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
        const message = addToConversation('summary', text, summaryContent, language);
        onSummaryGenerated(text, summaryContent, language);
        setSidebarOpen(true);
      } else if (action === 'explanation') {
        result = await postExplanation(text, language);
        
        let explanationContent;
        if (language === 'both' && result.arabic_explanation && result.english_explanation) {
          explanationContent = {
            english: result.english_explanation,
            arabic: result.arabic_explanation
          };
        } else if (language === 'arabic') {
          explanationContent = result.arabic_explanation || result.explanation;
        } else {
          explanationContent = result.english_explanation || result.explanation;
        }
        
        const message = addToConversation('explanation', text, explanationContent, language);
        onExplanationGenerated(text, explanationContent, language);
        
      } else if (action === 'exercises') {
        result = await postExercises(text, language);
        const exercisesContent = result.exercises || result.data || result;
        
        const message = addToConversation('exercises', text, exercisesContent, language);
        onExercisesGenerated(text, exercisesContent, language);
        onResultsGenerated({
          type: 'exercises',
          data: result
        });
      }
      
      // Clear the input after successful generation
      setText('');
      
    } catch (err) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'summary': return '📝';
      case 'explanation': return '📚';
      case 'exercises': return '💪';
      default: return '📄';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'summary': return 'Summary';
      case 'explanation': return 'Explanation';
      case 'exercises': return 'Exercises';
      default: return 'Content';
    }
  };

  const formatLanguage = (lang) => {
    switch (lang) {
      case 'arabic': return '🇸🇦 Arabic';
      case 'english': return '🇺🇸 English';
      case 'both': return '🌐 Both Languages';
      default: return '🌐 Both Languages';
    }
  };

  if (loading) {
    return <Spinner message="Generating content with AI..." />;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Conversation Area */}
      {conversation.length > 0 && (
        <div className="space-y-6 mb-8">
          {conversation.map((message) => (
            <div key={message.id} className="space-y-4">
              {/* User Input */}
              <div className="flex justify-end">
                <div className="max-w-3xl bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-blue-700">You asked for:</span>
                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                      {getTypeIcon(message.messageType)} {getTypeLabel(message.messageType)}
                    </span>
                    <span className="text-xs text-blue-500">
                      {formatLanguage(message.language)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700 bg-white p-3 rounded border">
                    {message.originalText}
                  </div>
                </div>
              </div>

              {/* AI Response */}
              <div className="flex justify-start">
                <div className="max-w-4xl w-full">
                  <Card className="shadow-sm border-gray-200">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-lg">{getTypeIcon(message.messageType)}</span>
                      <span className="font-medium text-gray-900">
                        AI {getTypeLabel(message.messageType)}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {formatLanguage(message.language)}
                      </span>
                      <span className="text-xs text-gray-400 ml-auto">
                        {new Date(message.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <ContentRenderer 
                      content={message.content} 
                      language={message.language} 
                    />
                  </Card>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        {conversation.length === 0 && (
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              AI Bootcamp Tutor
            </h1>
            <p className="text-gray-600">
              Paste your course content below and generate summaries, explanations, or practice exercises
            </p>
          </div>
        )}

        {error && (
          <Alert 
            type="error" 
            onClose={() => setError(null)}
            className="mb-4"
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
              className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
              disabled={loading}
            />
            <div className="text-xs text-gray-500 mt-1">
              Characters: {text.length}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <LanguageSelector
              value={language}
              onChange={setLanguage}
              disabled={loading}
            />

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={() => handleSubmit('summary')}
                disabled={loading || !text.trim()}
                variant="outline"
                className="w-full sm:w-auto"
              >
                📝 Summarize
              </Button>
              <Button
                onClick={() => handleSubmit('explanation')}
                disabled={loading || !text.trim()}
                variant="outline"
                className="w-full sm:w-auto"
              >
                📚 Explain
              </Button>
              <Button
                onClick={() => handleSubmit('exercises')}
                disabled={loading || !text.trim()}
                variant="primary"
                className="w-full sm:w-auto"
              >
                💪 Generate Exercises
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;