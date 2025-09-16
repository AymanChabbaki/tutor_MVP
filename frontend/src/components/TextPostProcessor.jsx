import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * TextPostProcessor - Handles Arabic RTL/LTR detection and markdown parsing
 * This component processes text from Gemini AI to ensure proper rendering
 */
const TextPostProcessor = ({ 
  text, 
  className = "", 
  customComponents = {},
  enableMarkdown = true 
}) => {
  // Function to detect if text contains Arabic characters
  const isArabic = (text) => {
    if (!text) return false;
    // Unicode range for Arabic characters
    const arabicRegex = /[\u0600-\u06FF]/;
    const arabicMatches = text.match(/[\u0600-\u06FF]/g);
    const totalChars = text.replace(/\s/g, '').length;
    
    // Consider it Arabic if more than 30% of non-space characters are Arabic
    if (arabicMatches && totalChars > 0) {
      return (arabicMatches.length / totalChars) > 0.3;
    }
    return false;
  };

  // Check if the text is predominantly Arabic
  const isTextArabic = isArabic(text);

  // Default markdown components with proper styling
  const defaultComponents = {
    // Headers with proper styling
    h1: ({ children }) => (
      <h1 className="text-2xl font-bold text-gray-900 mt-8 mb-5 pb-3 border-b-2 border-gray-400">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-xl font-bold text-blue-800 mt-7 mb-4 pb-2 border-b-2 border-blue-300">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-lg font-semibold text-indigo-800 mt-6 mb-3 pb-2 border-b border-indigo-200">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-base font-semibold text-gray-800 mt-5 mb-2">
        {children}
      </h4>
    ),
    
    // Paragraphs with proper spacing
    p: ({ children }) => (
      <p className="text-gray-700 leading-relaxed mb-4">
        {children}
      </p>
    ),
    
    // Strong/bold text
    strong: ({ children }) => (
      <strong className="font-semibold text-gray-900 bg-blue-100 px-1.5 py-0.5 rounded">
        {children}
      </strong>
    ),
    
    // Emphasis/italic text
    em: ({ children }) => (
      <em className="italic text-blue-800">
        {children}
      </em>
    ),
    
    // Unordered lists
    ul: ({ children }) => (
      <ul className="list-disc list-inside space-y-2 mb-4 ml-4 text-gray-700">
        {children}
      </ul>
    ),
    
    // Ordered lists
    ol: ({ children }) => (
      <ol className="list-decimal list-inside space-y-2 mb-4 ml-4 text-gray-700">
        {children}
      </ol>
    ),
    
    // List items
    li: ({ children }) => (
      <li className="leading-relaxed">
        {children}
      </li>
    ),
    
    // Code blocks
    code: ({ inline, children }) => {
      if (inline) {
        return (
          <code className="bg-gray-100 text-gray-800 px-2 py-1 rounded font-mono text-sm">
            {children}
          </code>
        );
      }
      return (
        <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto mb-4">
          <code className="font-mono text-sm text-gray-800">
            {children}
          </code>
        </pre>
      );
    },
    
    // Blockquotes
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-blue-400 pl-4 italic text-gray-600 my-4 bg-blue-50 py-2">
        {children}
      </blockquote>
    ),
    
    // Links
    a: ({ href, children }) => (
      <a 
        href={href} 
        className="text-blue-600 hover:text-blue-800 underline"
        target="_blank" 
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
    
    // Tables
    table: ({ children }) => (
      <div className="overflow-x-auto mb-4">
        <table className="min-w-full border border-gray-300">
          {children}
        </table>
      </div>
    ),
    th: ({ children }) => (
      <th className="border border-gray-300 px-4 py-2 bg-gray-100 font-semibold text-left">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="border border-gray-300 px-4 py-2">
        {children}
      </td>
    ),
  };

  // Merge default components with custom ones
  const components = { ...defaultComponents, ...customComponents };

  // Determine text direction and alignment
  const textDirection = isTextArabic ? 'rtl' : 'ltr';
  const textAlignment = isTextArabic ? 'text-right' : 'text-left';
  const fontFamily = isTextArabic ? 'font-[Tajawal]' : '';

  // Base container classes
  const containerClasses = `
    ${textAlignment} 
    ${fontFamily} 
    ${className}
  `.trim();

  if (!enableMarkdown) {
    // Return plain text with proper direction handling
    return (
      <div 
        dir={textDirection} 
        className={containerClasses}
      >
        {text}
      </div>
    );
  }

  // Return markdown-processed content with proper direction handling
  return (
    <div 
      dir={textDirection} 
      className={containerClasses}
    >
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={components}
      >
        {text || ''}
      </ReactMarkdown>
    </div>
  );
};

export default TextPostProcessor;