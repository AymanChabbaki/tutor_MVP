import React, { useState, useEffect } from 'react';
import Card from './Card';
import Button from './Button';

const Sidebar = ({ 
  history = [], 
  isOpen, 
  onToggle,
  onClearHistory,
  onItemClick,
  className = '' 
}) => {
  const [expandedItems, setExpandedItems] = useState(new Set());

  const toggleExpanded = (id) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleItemClick = (item) => {
    if (onItemClick) {
      onItemClick(item);
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

  const formatLanguage = (language) => {
    switch (language) {
      case 'arabic': return '🇸🇦 Arabic';
      case 'english': return '🇺🇸 English';
      case 'both': return '🌐 Both Languages';
      default: return '🌐 Both Languages';
    }
  };

  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-80 bg-white border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          lg:transform-none
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${className}
        `}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">📚 History</h2>
          <div className="flex gap-2">
            {history.length > 0 && (
              <Button
                variant="ghost"
                size="small"
                onClick={onClearHistory}
                className="text-red-500 hover:text-red-700"
                title="Clear history"
              >
                🗑️
              </Button>
            )}
            <Button
              variant="ghost"
              size="small"
              onClick={onToggle}
              className="lg:hidden"
            >
              ✕
            </Button>
          </div>
        </div>

        {/* Sidebar content */}
        <div className="h-full overflow-y-auto p-4">
          {history.length > 0 ? (
            <div className="space-y-3">
              {history.map((item) => {
                const isExpanded = expandedItems.has(item.id);
                return (
                  <div key={item.id} className="border border-gray-200 rounded-lg bg-gray-50">
                    {/* Item header */}
                    <div className="flex items-center justify-between p-3">
                      <div 
                        className="flex items-center gap-2 flex-1 cursor-pointer hover:bg-gray-100 rounded p-1 -m-1"
                        onClick={() => handleItemClick(item)}
                        title="Click to view on main page"
                      >
                        <span className="text-lg">{getTypeIcon(item.type)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm text-gray-900">
                              {getTypeLabel(item.type)}
                            </span>
                            <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                              {formatLanguage(item.language)}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(item.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpanded(item.id);
                        }}
                        className="text-gray-400 ml-2 hover:text-gray-600 p-1 rounded"
                        title={isExpanded ? "Collapse" : "Expand"}
                      >
                        {isExpanded ? '▼' : '▶'}
                      </button>
                    </div>

                    {/* Item content */}
                    {isExpanded && (
                      <div className="border-t border-gray-200 p-3">
                        {/* Original input */}
                        <div className="mb-3">
                          <div className="text-xs font-medium text-gray-500 mb-1">Original Text:</div>
                          <div className="text-xs text-gray-600 bg-white p-2 rounded border">
                            {truncateText(item.originalText, 150)}
                          </div>
                        </div>

                        {/* Generated content */}
                        <Card
                          showCopyButton={true}
                          copyText={typeof item.content === 'string' ? item.content : JSON.stringify(item.content)}
                          className="border-none shadow-none bg-white"
                        >
                          <div className="text-sm text-gray-700 leading-relaxed">
                            {typeof item.content === 'string' ? (
                              <div className="whitespace-pre-wrap">{item.content}</div>
                            ) : (
                              <div className="space-y-3">
                                {item.content.english && (
                                  <div>
                                    <div className="font-medium text-blue-600 mb-1">🇺🇸 English:</div>
                                    <div className="whitespace-pre-wrap">{item.content.english}</div>
                                  </div>
                                )}
                                {item.content.arabic && (
                                  <div>
                                    <div className="font-medium text-green-600 mb-1">🇸🇦 Arabic:</div>
                                    <div className="whitespace-pre-wrap text-right" dir="rtl">{item.content.arabic}</div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </Card>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 text-sm">
                � No history yet.
              </div>
              <div className="text-gray-400 text-xs mt-2">
                Use the buttons to generate content and it will appear here.
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;