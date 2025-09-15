import React from 'react';

const ContentRenderer = ({ content, language = 'english' }) => {
  const renderMarkdown = (text) => {
    if (!text) return '';
    
    // Handle different line endings
    let processedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    // Split into lines for processing
    const lines = processedText.split('\n');
    const elements = [];
    let currentParagraph = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Handle headings
      if (line.startsWith('###')) {
        // Flush current paragraph
        if (currentParagraph.length > 0) {
          elements.push(
            <p key={`p-${elements.length}`} className="mb-4 leading-relaxed">
              {renderInlineMarkdown(currentParagraph.join(' '))}
            </p>
          );
          currentParagraph = [];
        }
        elements.push(
          <h3 key={`h3-${elements.length}`} className="text-lg font-bold text-gray-800 mt-6 mb-3 flex items-center">
            <span className="mr-2">📝</span>
            {line.replace(/^###\s*/, '')}
          </h3>
        );
      } else if (line.startsWith('##')) {
        // Flush current paragraph
        if (currentParagraph.length > 0) {
          elements.push(
            <p key={`p-${elements.length}`} className="mb-4 leading-relaxed">
              {renderInlineMarkdown(currentParagraph.join(' '))}
            </p>
          );
          currentParagraph = [];
        }
        elements.push(
          <h2 key={`h2-${elements.length}`} className="text-xl font-bold text-gray-900 mt-6 mb-4 flex items-center">
            <span className="mr-2">🎯</span>
            {line.replace(/^##\s*/, '')}
          </h2>
        );
      } else if (line.startsWith('#')) {
        // Flush current paragraph
        if (currentParagraph.length > 0) {
          elements.push(
            <p key={`p-${elements.length}`} className="mb-4 leading-relaxed">
              {renderInlineMarkdown(currentParagraph.join(' '))}
            </p>
          );
          currentParagraph = [];
        }
        elements.push(
          <h1 key={`h1-${elements.length}`} className="text-2xl font-bold text-blue-600 mt-8 mb-4 flex items-center">
            <span className="mr-2">🚀</span>
            {line.replace(/^#\s*/, '')}
          </h1>
        );
      } else if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
        // Handle bullet points
        if (currentParagraph.length > 0) {
          elements.push(
            <p key={`p-${elements.length}`} className="mb-4 leading-relaxed">
              {renderInlineMarkdown(currentParagraph.join(' '))}
            </p>
          );
          currentParagraph = [];
        }
        
        // Collect consecutive bullet points
        const bulletPoints = [line];
        while (i + 1 < lines.length && (lines[i + 1].trim().startsWith('•') || lines[i + 1].trim().startsWith('-') || lines[i + 1].trim().startsWith('*'))) {
          i++;
          bulletPoints.push(lines[i].trim());
        }
        
        elements.push(
          <ul key={`ul-${elements.length}`} className="mb-4 ml-4 space-y-2">
            {bulletPoints.map((bullet, idx) => (
              <li key={idx} className="flex items-start">
                <span className="text-blue-500 mr-2 mt-1">•</span>
                <span className="flex-1">
                  {renderInlineMarkdown(bullet.replace(/^[•\-*]\s*/, ''))}
                </span>
              </li>
            ))}
          </ul>
        );
      } else if (line === '') {
        // Empty line - flush paragraph if exists
        if (currentParagraph.length > 0) {
          elements.push(
            <p key={`p-${elements.length}`} className="mb-4 leading-relaxed">
              {renderInlineMarkdown(currentParagraph.join(' '))}
            </p>
          );
          currentParagraph = [];
        }
      } else {
        // Regular text line
        currentParagraph.push(line);
      }
    }
    
    // Flush remaining paragraph
    if (currentParagraph.length > 0) {
      elements.push(
        <p key={`p-${elements.length}`} className="mb-4 leading-relaxed">
          {renderInlineMarkdown(currentParagraph.join(' '))}
        </p>
      );
    }
    
    return elements;
  };
  
  const renderInlineMarkdown = (text) => {
    if (!text) return '';
    
    // Handle bold text **text**
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-semibold text-gray-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };
  
  const renderContent = () => {
    if (typeof content === 'string') {
      return (
        <div className={`prose max-w-none ${language === 'arabic' ? 'text-right' : 'text-left'}`} dir={language === 'arabic' ? 'rtl' : 'ltr'}>
          {renderMarkdown(content)}
        </div>
      );
    } else if (typeof content === 'object' && content !== null) {
      // Handle objects with multiple languages
      return (
        <div className="space-y-6">
          {content.english && (
            <div className="border-l-4 border-blue-500 pl-4">
              <div className="flex items-center mb-2">
                <span className="text-lg mr-2">🇺🇸</span>
                <h3 className="font-semibold text-blue-600">English</h3>
              </div>
              <div className="prose max-w-none text-left" dir="ltr">
                {renderMarkdown(content.english)}
              </div>
            </div>
          )}
          {content.arabic && (
            <div className="border-r-4 border-green-500 pr-4">
              <div className="flex items-center mb-2 justify-end">
                <h3 className="font-semibold text-green-600">العربية</h3>
                <span className="text-lg ml-2">🇸🇦</span>
              </div>
              <div className="prose max-w-none text-right" dir="rtl">
                {renderMarkdown(content.arabic)}
              </div>
            </div>
          )}
        </div>
      );
    }
    
    return <div className="text-gray-500 italic">No content available</div>;
  };
  
  return renderContent();
};

export default ContentRenderer;