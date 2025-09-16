import React, { useState } from 'react';
import { FileText, BookOpen, Dumbbell, MessageCircle, Copy, Check } from 'lucide-react';
import Button from './Button';
import ContentRenderer from './ContentRenderer_new';

const MessageBubble = ({ message }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const getActionIcon = (actionType) => {
    switch (actionType) {
      case 'summary': return FileText;
      case 'explanation': return BookOpen;
      case 'exercises': return Dumbbell;
      default: return MessageCircle;
    }
  };

  const getActionLabel = (actionType) => {
    switch (actionType) {
      case 'summary': return 'Summary';
      case 'explanation': return 'Explanation';
      case 'exercises': return 'Exercises';
      default: return 'Message';
    }
  };

  const getLanguageFlag = (language) => {
    switch (language) {
      case 'arabic': return '🇸🇦';
      case 'english': return '🇺🇸';
      case 'both': return '🌐';
      default: return '🌐';
    }
  };

  if (message.type === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-3xl">
          <div className="bg-blue-600 text-white rounded-2xl rounded-br-md px-4 py-3 shadow-sm">
            <div className="flex items-center gap-2 mb-2 opacity-90">
              <span className="text-sm flex items-center gap-1">
                {React.createElement(getActionIcon(message.actionType), { size: 14 })}
                {getActionLabel(message.actionType)}
              </span>
              <span className="text-sm">{getLanguageFlag(message.language)}</span>
            </div>
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {message.content}
            </div>
          </div>
          <div className="text-xs text-gray-500 text-right mt-1 px-2">
            {new Date(message.timestamp).toLocaleTimeString()}
          </div>
        </div>
      </div>
    );
  }

  if (message.type === 'error') {
    return (
      <div className="flex justify-start">
        <div className="max-w-3xl">
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-2xl rounded-bl-md px-4 py-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm">Error</span>
            </div>
            <div className="text-sm leading-relaxed">
              {message.content}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // AI message
  return (
    <div className="flex justify-start">
      <div className="max-w-3xl w-full">
        <div className="bg-white rounded-2xl rounded-bl-md shadow-sm border border-gray-200">
          {/* Header */}
          <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">AI</span>
              </div>
              <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                {React.createElement(getActionIcon(message.actionType), { size: 14 })}
                {getActionLabel(message.actionType)}
              </span>
              <span className="text-sm text-gray-500">{getLanguageFlag(message.language)}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="small"
                onClick={() => handleCopy(typeof message.content === 'string' ? message.content : JSON.stringify(message.content))}
                className="text-gray-400 hover:text-gray-600"
                title="Copy content"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="px-4 py-3">
            <ContentRenderer content={message.content} actionType={message.actionType} language={message.language} />
          </div>
        </div>
        
        <div className="text-xs text-gray-500 text-left mt-1 px-2">
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;