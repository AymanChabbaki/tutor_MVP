# AI Bootcamp Tutor MVP - Frontend Development Guide

## 📋 Project Overview

The AI Bootcamp Tutor MVP is an educational platform that helps students understand course content through AI-powered features:

- **Content Summarization**: Generate concise summaries of course materials
- **Multilingual Explanations**: Get detailed explanations in both Arabic and English
- **Exercise Generation**: Automatically create practice questions with answers
- **User Management**: Track learning sessions and progress

## 🎯 User Experience Goals

### Target Users
- **Students** learning programming, AI, and technical subjects
- **Arabic and English speakers** needing multilingual support
- **Self-learners** who want interactive study tools

### Core User Journey
1. Student copies course content or headings
2. Pastes content into the application
3. Chooses desired AI feature (summarize, explain, or generate exercises)
4. Receives AI-generated educational content
5. Can save sessions for later review

## 🎨 UI/UX Requirements

### Design Principles
- **Clean and Simple**: Focus on content, minimal distractions
- **Bilingual Support**: RTL (Arabic) and LTR (English) layouts
- **Responsive**: Works on desktop, tablet, and mobile
- **Accessible**: WCAG 2.1 AA compliance
- **Fast Loading**: Optimized for quick interactions

### Color Scheme Suggestions
```css
:root {
  --primary-blue: #2563eb;
  --primary-light: #3b82f6;
  --secondary-green: #10b981;
  --accent-purple: #8b5cf6;
  --neutral-gray: #6b7280;
  --light-gray: #f3f4f6;
  --dark-gray: #1f2937;
  --white: #ffffff;
  --error-red: #ef4444;
  --warning-yellow: #f59e0b;
  --success-green: #22c55e;
}
```

### Typography
- **Primary Font**: Inter, Roboto, or system fonts
- **Arabic Font**: Noto Sans Arabic, Cairo, or Tajawal
- **Code Font**: JetBrains Mono, Fira Code, or monospace

## 📱 Page Structure & Components

### 1. Landing/Home Page
```
Header
├── Logo/Brand
├── Navigation (Home, Features, About)
└── Language Toggle (EN/AR)

Hero Section
├── Main Headline
├── Subtitle/Description
├── Primary CTA Button
└── Feature Preview

Features Section
├── Summarize Feature Card
├── Explain Feature Card
└── Exercises Feature Card

Footer
├── Contact Info
├── Links
└── Copyright
```

### 2. Main Application Page
```
Header
├── Logo
├── User Profile/Settings
└── Language Toggle

Main Content Area
├── Input Section
│   ├── Text Area (paste content)
│   ├── Feature Selection Buttons
│   └── Submit Button
├── Loading State
├── Results Section
│   ├── Summary Display
│   ├── Explanation Display (Arabic/English)
│   └── Exercises List
└── Session History Sidebar

Footer
└── Minimal footer with essentials
```

### 3. User Dashboard (Optional)
```
Header (same as main app)

Dashboard Content
├── Welcome Message
├── Recent Sessions
├── Statistics/Progress
└── Quick Actions
```

## 🔧 Technical Specifications

### Frontend Framework Recommendations
- **React.js** (most popular, large ecosystem)
- **Vue.js** (easier learning curve, good documentation)
- **Next.js** (React with SSR, good for SEO)
- **Nuxt.js** (Vue with SSR)

### State Management
- **React**: Redux Toolkit, Zustand, or Context API
- **Vue**: Vuex or Pinia

### Styling Options
- **CSS Frameworks**: Tailwind CSS (recommended), Bootstrap, or Bulma
- **Component Libraries**: 
  - React: Material-UI, Ant Design, Chakra UI
  - Vue: Vuetify, Quasar, Element Plus

### Internationalization (i18n)
- **React**: react-i18next
- **Vue**: vue-i18n
- **Support**: Arabic (RTL) and English (LTR)

## 🌐 API Integration

### Base Configuration
```javascript
// API Configuration
const API_CONFIG = {
  baseURL: 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};
```

### API Endpoints

#### 1. Health Check
```javascript
// GET /api/health
fetch(`${API_CONFIG.baseURL}/health`)
  .then(response => response.json())
  .then(data => console.log(data));

// Expected Response:
{
  "status": "healthy",
  "service": "AI Bootcamp Tutor MVP",
  "version": "1.0.0"
}
```

#### 2. Content Summarization
```javascript
// POST /api/summarize
const summarizeContent = async (text, userId = null) => {
  const response = await fetch(`${API_CONFIG.baseURL}/summarize`, {
    method: 'POST',
    headers: API_CONFIG.headers,
    body: JSON.stringify({
      text: text,
      user_id: userId
    })
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
};

// Expected Response:
{
  "summary": "Generated summary of the content...",
  "session_id": 123  // if user_id provided
}

// Error Response:
{
  "error": "Invalid input",
  "message": "Field text cannot be empty"
}
```

#### 3. Content Explanation
```javascript
// POST /api/explain
const explainContent = async (text, userId = null) => {
  const response = await fetch(`${API_CONFIG.baseURL}/explain`, {
    method: 'POST',
    headers: API_CONFIG.headers,
    body: JSON.stringify({
      text: text,
      user_id: userId
    })
  });
  
  return await response.json();
};

// Expected Response:
{
  "arabic_explanation": "شرح مفصل باللغة العربية...",
  "english_explanation": "Detailed explanation in English...",
  "session_id": 124
}
```

#### 4. Exercise Generation
```javascript
// POST /api/generate_exercises
const generateExercises = async (text, userId = null) => {
  const response = await fetch(`${API_CONFIG.baseURL}/generate_exercises`, {
    method: 'POST',
    headers: API_CONFIG.headers,
    body: JSON.stringify({
      text: text,
      user_id: userId
    })
  });
  
  return await response.json();
};

// Expected Response:
{
  "exercises": [
    {
      "question": "What is machine learning?",
      "answer": "Machine learning is a method of data analysis..."
    },
    {
      "question": "What are the main types of ML?",
      "answer": "The main types are supervised, unsupervised..."
    },
    {
      "question": "How does deep learning differ?",
      "answer": "Deep learning uses neural networks..."
    }
  ],
  "session_id": 125
}
```

#### 5. User Management
```javascript
// POST /api/users - Create User
const createUser = async (name, email, languagePref = 'english') => {
  const response = await fetch(`${API_CONFIG.baseURL}/users`, {
    method: 'POST',
    headers: API_CONFIG.headers,
    body: JSON.stringify({
      name: name,
      email: email,
      language_pref: languagePref
    })
  });
  
  return await response.json();
};

// Expected Response:
{
  "user": {
    "id": 1,
    "name": "Ahmed Student",
    "email": "ahmed@example.com",
    "languagePref": "english",
    "createdAt": "2023-12-01T10:30:00Z"
  }
}

// GET /api/users/{email}/sessions - Get User Sessions
const getUserSessions = async (email, limit = 10) => {
  const response = await fetch(
    `${API_CONFIG.baseURL}/users/${encodeURIComponent(email)}/sessions?limit=${limit}`
  );
  
  return await response.json();
};

// Expected Response:
{
  "sessions": [
    {
      "id": 1,
      "inputText": "Course content...",
      "outputSummary": "Summary...",
      "outputExplanation": "Explanation...",
      "outputExercises": [...],
      "createdAt": "2023-12-01T10:30:00Z"
    }
  ]
}
```

## 📝 Component Specifications

### 1. Text Input Component
```jsx
// React Example
const TextInputArea = ({ 
  value, 
  onChange, 
  placeholder, 
  maxLength = 5000,
  disabled = false 
}) => {
  return (
    <div className="text-input-container">
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={disabled}
        className="w-full p-4 border rounded-lg resize-none"
        rows={8}
      />
      <div className="text-right text-sm text-gray-500 mt-2">
        {value.length}/{maxLength} characters
      </div>
    </div>
  );
};
```

### 2. Feature Selection Component
```jsx
const FeatureSelector = ({ selectedFeature, onFeatureChange }) => {
  const features = [
    {
      id: 'summarize',
      title: 'Summarize',
      description: 'Get a concise summary',
      icon: '📝'
    },
    {
      id: 'explain',
      title: 'Explain',
      description: 'Detailed explanation in Arabic & English',
      icon: '🗣️'
    },
    {
      id: 'exercises',
      title: 'Generate Exercises',
      description: 'Practice questions and answers',
      icon: '🎯'
    }
  ];

  return (
    <div className="feature-selector grid grid-cols-1 md:grid-cols-3 gap-4">
      {features.map(feature => (
        <button
          key={feature.id}
          onClick={() => onFeatureChange(feature.id)}
          className={`feature-card p-4 border rounded-lg ${
            selectedFeature === feature.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
          }`}
        >
          <div className="text-2xl mb-2">{feature.icon}</div>
          <h3 className="font-semibold">{feature.title}</h3>
          <p className="text-sm text-gray-600">{feature.description}</p>
        </button>
      ))}
    </div>
  );
};
```

### 3. Loading Component
```jsx
const LoadingSpinner = ({ message = "Processing your request..." }) => {
  return (
    <div className="loading-container flex flex-col items-center justify-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      <p className="mt-4 text-gray-600">{message}</p>
    </div>
  );
};
```

### 4. Results Display Components
```jsx
// Summary Component
const SummaryResult = ({ summary }) => {
  return (
    <div className="result-card bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        📝 Summary
      </h3>
      <p className="text-gray-700 leading-relaxed">{summary}</p>
    </div>
  );
};

// Explanation Component
const ExplanationResult = ({ arabicExplanation, englishExplanation }) => {
  return (
    <div className="result-card bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        🗣️ Detailed Explanation
      </h3>
      
      <div className="space-y-6">
        <div className="arabic-explanation">
          <h4 className="font-medium mb-2 text-right">الشرح بالعربية</h4>
          <p className="text-gray-700 leading-relaxed text-right" dir="rtl">
            {arabicExplanation}
          </p>
        </div>
        
        <div className="english-explanation">
          <h4 className="font-medium mb-2">English Explanation</h4>
          <p className="text-gray-700 leading-relaxed">
            {englishExplanation}
          </p>
        </div>
      </div>
    </div>
  );
};

// Exercises Component
const ExercisesResult = ({ exercises }) => {
  return (
    <div className="result-card bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        🎯 Practice Exercises
      </h3>
      
      <div className="space-y-4">
        {exercises.map((exercise, index) => (
          <div key={index} className="exercise-item border-l-4 border-blue-500 pl-4">
            <div className="question mb-2">
              <span className="font-medium text-blue-600">Q{index + 1}:</span>
              <span className="ml-2">{exercise.question}</span>
            </div>
            <div className="answer text-gray-700">
              <span className="font-medium text-green-600">A:</span>
              <span className="ml-2">{exercise.answer}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

### 5. Error Handling Component
```jsx
const ErrorDisplay = ({ error, onRetry }) => {
  return (
    <div className="error-container bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-center mb-2">
        <span className="text-red-500 text-xl mr-2">⚠️</span>
        <h4 className="text-red-800 font-medium">Something went wrong</h4>
      </div>
      <p className="text-red-700 mb-4">{error}</p>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Try Again
        </button>
      )}
    </div>
  );
};
```

## 🔐 Authentication & User Management

### Simple User Registration Flow
1. **Guest Mode**: Allow anonymous usage with limited features
2. **Registration**: Simple form with name, email, language preference
3. **Local Storage**: Store user info locally (no complex auth needed for MVP)
4. **Session Tracking**: Link user sessions to their profile

### User State Management
```javascript
// User Context/Store
const userState = {
  user: {
    id: null,
    name: '',
    email: '',
    languagePref: 'english',
    isLoggedIn: false
  },
  sessions: [],
  currentSession: null
};

// Actions
const userActions = {
  loginUser: (userData) => { /* update state */ },
  logoutUser: () => { /* clear state */ },
  updatePreferences: (prefs) => { /* update prefs */ },
  addSession: (session) => { /* add to sessions */ }
};
```

## 🌍 Internationalization Setup

### Language Files Structure
```
/src/locales/
├── en.json
├── ar.json
└── index.js
```

### English Translations (en.json)
```json
{
  "common": {
    "loading": "Loading...",
    "error": "Error",
    "submit": "Submit",
    "cancel": "Cancel",
    "retry": "Try Again"
  },
  "navigation": {
    "home": "Home",
    "features": "Features",
    "about": "About",
    "profile": "Profile"
  },
  "features": {
    "summarize": {
      "title": "Summarize",
      "description": "Get a concise summary of your content",
      "button": "Generate Summary",
      "placeholder": "Paste your course content here..."
    },
    "explain": {
      "title": "Explain",
      "description": "Get detailed explanations in Arabic and English",
      "button": "Generate Explanation"
    },
    "exercises": {
      "title": "Generate Exercises",
      "description": "Create practice questions with answers",
      "button": "Generate Exercises"
    }
  },
  "results": {
    "summary": "Summary",
    "arabicExplanation": "Arabic Explanation",
    "englishExplanation": "English Explanation",
    "exercises": "Practice Exercises",
    "question": "Question",
    "answer": "Answer"
  }
}
```

### Arabic Translations (ar.json)
```json
{
  "common": {
    "loading": "جاري التحميل...",
    "error": "خطأ",
    "submit": "إرسال",
    "cancel": "إلغاء",
    "retry": "إعادة المحاولة"
  },
  "navigation": {
    "home": "الرئيسية",
    "features": "الميزات",
    "about": "حول",
    "profile": "الملف الشخصي"
  },
  "features": {
    "summarize": {
      "title": "تلخيص",
      "description": "احصل على ملخص مقتضب لمحتواك",
      "button": "إنشاء ملخص",
      "placeholder": "الصق محتوى الدورة هنا..."
    },
    "explain": {
      "title": "شرح",
      "description": "احصل على شروحات مفصلة بالعربية والإنجليزية",
      "button": "إنشاء شرح"
    },
    "exercises": {
      "title": "إنشاء تمارين",
      "description": "أنشئ أسئلة تدريبية مع الإجابات",
      "button": "إنشاء تمارين"
    }
  },
  "results": {
    "summary": "الملخص",
    "arabicExplanation": "الشرح بالعربية",
    "englishExplanation": "الشرح بالإنجليزية",
    "exercises": "التمارين التدريبية",
    "question": "السؤال",
    "answer": "الإجابة"
  }
}
```

## 📱 Responsive Design Guidelines

### Breakpoints
```css
/* Mobile First Approach */
.container {
  /* Mobile: 320px - 768px */
  padding: 1rem;
}

@media (min-width: 768px) {
  /* Tablet: 768px - 1024px */
  .container {
    padding: 2rem;
  }
}

@media (min-width: 1024px) {
  /* Desktop: 1024px+ */
  .container {
    padding: 3rem;
    max-width: 1200px;
    margin: 0 auto;
  }
}
```

### Mobile Considerations
- **Touch-friendly buttons**: Minimum 44px tap targets
- **Readable text**: Minimum 16px font size
- **Optimized input**: Large text areas, easy typing
- **Offline support**: Cache results when possible

## 🚀 Performance Optimization

### Code Splitting
```javascript
// Lazy load components
const Dashboard = lazy(() => import('./components/Dashboard'));
const UserProfile = lazy(() => import('./components/UserProfile'));

// Use Suspense for loading states
<Suspense fallback={<LoadingSpinner />}>
  <Dashboard />
</Suspense>
```

### API Optimization
```javascript
// Debounced input to avoid excessive API calls
const debouncedSubmit = useCallback(
  debounce((text) => {
    if (text.length > 50) { // Only call API for substantial content
      // Make API call
    }
  }, 500),
  []
);

// Cache API responses
const apiCache = new Map();

const cachedApiCall = async (endpoint, data) => {
  const cacheKey = `${endpoint}-${JSON.stringify(data)}`;
  
  if (apiCache.has(cacheKey)) {
    return apiCache.get(cacheKey);
  }
  
  const result = await fetch(endpoint, { body: JSON.stringify(data) });
  apiCache.set(cacheKey, result);
  
  return result;
};
```

## 🎯 User Experience Enhancements

### Progressive Enhancement
1. **Basic functionality first**: Core features work without JavaScript
2. **Enhanced experience**: Add interactive features progressively
3. **Graceful degradation**: Fallbacks for older browsers

### Accessibility Features
```jsx
// Screen reader support
<button 
  aria-label="Generate summary of the content"
  aria-describedby="summary-description"
>
  Summarize
</button>

// Keyboard navigation
const handleKeyDown = (e) => {
  if (e.key === 'Enter' && e.ctrlKey) {
    handleSubmit();
  }
};

// Focus management
useEffect(() => {
  if (showResults) {
    resultsRef.current?.focus();
  }
}, [showResults]);
```

### Loading States & Feedback
```jsx
const LoadingStates = {
  IDLE: 'idle',
  SUMMARIZING: 'Generating summary...',
  EXPLAINING: 'Creating explanations...',
  GENERATING_EXERCISES: 'Generating exercises...'
};

// Progress indicators for long operations
const ProgressIndicator = ({ stage, total }) => (
  <div className="progress-container">
    <div className="progress-bar">
      <div 
        className="progress-fill" 
        style={{ width: `${(stage / total) * 100}%` }}
      />
    </div>
    <p>Step {stage} of {total}</p>
  </div>
);
```

## 📊 Analytics & Tracking

### Events to Track
```javascript
// Feature usage
trackEvent('feature_used', { 
  feature: 'summarize',
  contentLength: text.length,
  language: currentLanguage 
});

// User engagement
trackEvent('session_duration', {
  duration: sessionDuration,
  actionsCount: userActions.length
});

// Error tracking
trackEvent('api_error', {
  endpoint: '/api/summarize',
  errorType: 'timeout',
  userAgent: navigator.userAgent
});
```

## 🔧 Development Environment Setup

### Recommended Project Structure
```
frontend-app/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── common/
│   │   ├── features/
│   │   └── layout/
│   ├── pages/
│   ├── hooks/
│   ├── services/
│   ├── locales/
│   ├── styles/
│   ├── utils/
│   └── App.js
├── package.json
├── tailwind.config.js
└── README.md
```

### Package.json Dependencies
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.4.0",
    "react-i18next": "^12.0.0",
    "axios": "^1.1.0",
    "tailwindcss": "^3.2.0",
    "framer-motion": "^7.6.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^2.2.0",
    "vite": "^3.2.0",
    "eslint": "^8.26.0",
    "prettier": "^2.7.0"
  }
}
```

## 🚢 Deployment Considerations

### Environment Variables
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENVIRONMENT=development
REACT_APP_ANALYTICS_ID=GA_TRACKING_ID
```

### Build Optimization
```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          i18n: ['react-i18next']
        }
      }
    }
  }
};
```

## 🎨 Design Assets & Resources

### Icons
- **Heroicons**: https://heroicons.com/
- **Lucide**: https://lucide.dev/
- **React Icons**: https://react-icons.github.io/react-icons/

### Fonts
- **Google Fonts**: Inter, Roboto
- **Arabic Fonts**: Noto Sans Arabic, Cairo

### Images
- **Illustrations**: unDraw, Storyset
- **Stock Photos**: Unsplash, Pexels

## 📞 Backend Integration Checklist

### ✅ API Integration Tasks
- [ ] Set up API client configuration
- [ ] Implement error handling for all endpoints
- [ ] Add loading states for all API calls
- [ ] Test all endpoints with different input sizes
- [ ] Handle network timeouts and retries
- [ ] Implement response caching where appropriate
- [ ] Add input validation before API calls
- [ ] Test Arabic text handling (RTL)
- [ ] Verify CORS configuration
- [ ] Test error responses and edge cases

### ✅ User Experience Tasks
- [ ] Create responsive design for all screen sizes
- [ ] Implement bilingual support (Arabic/English)
- [ ] Add accessibility features (ARIA labels, keyboard navigation)
- [ ] Create smooth loading animations
- [ ] Implement copy-to-clipboard functionality
- [ ] Add session history viewing
- [ ] Create user preference settings
- [ ] Test with various content types and lengths
- [ ] Optimize for mobile touch interactions
- [ ] Add offline state handling

### ✅ Performance Tasks
- [ ] Implement code splitting and lazy loading
- [ ] Optimize bundle size
- [ ] Add service worker for caching
- [ ] Implement debounced API calls
- [ ] Optimize images and assets
- [ ] Add performance monitoring
- [ ] Test with slow network conditions
- [ ] Implement progressive loading
- [ ] Add compression for text content
- [ ] Optimize font loading

## 📋 Testing Strategy

### Unit Testing
```javascript
// Example test for API service
import { summarizeContent } from '../services/api';

test('summarizeContent returns summary', async () => {
  const mockResponse = { summary: 'Test summary' };
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    })
  );

  const result = await summarizeContent('test content');
  expect(result.summary).toBe('Test summary');
});
```

### Integration Testing
```javascript
// Test component with API integration
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SummarizeComponent from '../components/SummarizeComponent';

test('displays summary after API call', async () => {
  render(<SummarizeComponent />);
  
  const textArea = screen.getByPlaceholderText(/paste your content/i);
  const submitButton = screen.getByText(/generate summary/i);
  
  fireEvent.change(textArea, { target: { value: 'test content' } });
  fireEvent.click(submitButton);
  
  await waitFor(() => {
    expect(screen.getByText(/test summary/i)).toBeInTheDocument();
  });
});
```

## 🚀 Getting Started Quick Guide

1. **Set up your development environment**
2. **Clone the backend repo and run the API server**
3. **Create the frontend project with your preferred framework**
4. **Install required dependencies**
5. **Set up API client and test connectivity**
6. **Implement core components step by step**
7. **Add internationalization support**
8. **Style with responsive design**
9. **Test thoroughly across devices and browsers**
10. **Deploy and monitor performance**

---

## 📞 Support & Communication

### Backend Developer Contact
- **API Documentation**: Available in the backend repo
- **Test Endpoints**: Use the provided test scripts
- **Issues**: Report any API issues immediately
- **Changes**: Coordinate any API changes in advance

### Key Files in Backend Repo
- `README.md` - Complete setup instructions
- `API_TESTING.md` - All endpoint examples
- `quick_test.py` - Quick API verification
- `.env.example` - Environment configuration

---

**Happy coding! 🚀**

*This guide provides everything needed to build a production-ready frontend for the AI Bootcamp Tutor MVP. Focus on user experience, performance, and accessibility to create an exceptional learning platform.*
