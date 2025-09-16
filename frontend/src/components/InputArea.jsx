import React, { useState, useRef } from 'react';
import { FileText, BookOpen, Dumbbell, Send } from 'lucide-react';
import Button from './Button';
import LanguageSelector from './LanguageSelector';

const InputArea = ({ onSubmit, disabled }) => {
  const [text, setText] = useState('');
  const [language, setLanguage] = useState('english');
  const [actionType, setActionType] = useState('summary');
  const textareaRef = useRef(null);

  const handleSubmit = (selectedActionType = actionType) => {
    if (!text.trim() || disabled) return;
    
    onSubmit(text, selectedActionType, language);
    setText('');
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
  };

  const actionButtons = [
    { id: 'summary', label: 'Summarize', icon: FileText, color: 'blue' },
    { id: 'explanation', label: 'Explain', icon: BookOpen, color: 'green' },
    { id: 'exercises', label: 'Practice', icon: Dumbbell, color: 'purple' }
  ];

  return (
    <div className="border-t border-gray-200 bg-white">
      <div className="max-w-4xl mx-auto px-4 py-4">
        {/* Quick Actions Bar */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Quick Actions:</span>
            {actionButtons.map((action) => {
              const IconComponent = action.icon;
              return (
                <Button
                  key={action.id}
                  variant={actionType === action.id ? 'primary' : 'ghost'}
                  size="small"
                  onClick={() => setActionType(action.id)}
                  className={`text-xs flex items-center gap-1 ${
                    actionType === action.id 
                      ? `bg-${action.color}-600 text-white` 
                      : `text-${action.color}-600 hover:bg-${action.color}-50`
                  }`}
                >
                  <IconComponent size={14} />
                  {action.label}
                </Button>
              );
            })}
          </div>
          
          <LanguageSelector language={language} onChange={setLanguage} />
        </div>

        {/* Input Area */}
        <div className="relative">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={text}
                onChange={handleTextChange}
                onKeyDown={handleKeyDown}
                placeholder={`Enter your course content for ${actionButtons.find(a => a.id === actionType)?.label.toLowerCase()}...`}
                disabled={disabled}
                className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 pr-12 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                style={{ minHeight: '52px', maxHeight: '200px' }}
              />
              
              {/* Character count */}
              <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                {text.length}/5000
              </div>
            </div>
            
            {/* Submit Buttons */}
            <div className="flex flex-col gap-1">
              <Button
                onClick={() => handleSubmit()}
                disabled={!text.trim() || disabled}
                className="px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {disabled ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Sending...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send size={16} />
                    <span>Send</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Helper Text */}
        <div className="mt-2 text-xs text-gray-500 text-center">
          Press Enter to send, Shift+Enter for new line. Max 5000 characters.
        </div>
      </div>
    </div>
  );
};

export default InputArea;