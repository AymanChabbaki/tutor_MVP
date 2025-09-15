import React from 'react';

const LanguageSelector = ({ language, onChange }) => {
  const languages = [
    { value: 'english', label: 'English', flag: '🇺🇸' },
    { value: 'arabic', label: 'العربية', flag: '🇸🇦' },
    { value: 'both', label: 'Both / كلاهما', flag: '🌐' }
  ];

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Language / اللغة
      </label>
      <div className="flex flex-wrap gap-2">
        {languages.map((lang) => (
          <button
            key={lang.value}
            onClick={() => onChange(lang.value)}
            className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
              language === lang.value
                ? 'bg-blue-100 border-blue-300 text-blue-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="mr-1">{lang.flag}</span>
            {lang.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelector;