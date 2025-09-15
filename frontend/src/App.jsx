import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './styles/components.css';
import TextInputArea from './components/TextInputArea';
import FeatureSelector from './components/FeatureSelector';
import LoadingSpinner from './components/LoadingSpinner';
import SummaryResult from './components/SummaryResult';
import ExplanationResult from './components/ExplanationResult';
import ExercisesResult from './components/ExercisesResult';
import ErrorDisplay from './components/ErrorDisplay';
import { summarizeContent, explainContent, generateExercises } from './services/api.jsx';

export default function App() {
  const { t, i18n } = useTranslation();
  const [text, setText] = useState('');
  const [feature, setFeature] = useState('summarize');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const sidebarRef = useRef();

  // Close sidebar when clicking outside
  useEffect(() => {
    if (!sidebarOpen) return;
    const handleClick = (e) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target) &&
        !e.target.classList.contains('sidebar-modern-toggle')
      ) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [sidebarOpen]);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
      document.querySelector('.app-bg')?.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
      document.querySelector('.app-bg')?.classList.remove('dark');
    }
  }, [darkMode]);

  const handleSubmit = async () => {
    setError(null);
    setResult(null);
    if (!text.trim()) { setError('Input is empty'); return; }
    setLoading(true);
    try {
      if (feature === 'summarize') {
        const res = await summarizeContent(text);
        setResult({ type: 'summary', payload: res });
      } else if (feature === 'explain') {
        const res = await explainContent(text);
        setResult({ type: 'explain', payload: res });
      } else {
        const res = await generateExercises(text);
        setResult({ type: 'exercises', payload: res });
      }
    } catch (err) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const toggleLang = () => {
    const next = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(next);
    document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr';
  };

  return (
    <div className={`app-bg${darkMode ? ' dark' : ''}`}>
      {/* Animated background */}
      <div className="animated-bg">
        <div className="smoke smoke1"></div>
        <div className="smoke smoke2"></div>
        <div className="smoke smoke3"></div>
      </div>
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`sidebar-modern ${sidebarOpen ? 'sidebar-modern--open' : ''}`}
      >
        <button
          className="sidebar-modern-toggle"
          onClick={() => setSidebarOpen((v) => !v)}
          aria-label={sidebarOpen ? "Close session history" : "Open session history"}
        >
          <span className={`arrow-modern ${sidebarOpen ? 'arrow-modern--left' : 'arrow-modern--right'}`}></span>
        </button>
        <div className="sidebar-modern-content">
          <h3>Session History</h3>
          <p>Session history will appear here (requires backend)</p>
        </div>
      </div>
      {/* Main content */}
      <div
        className={`main-content-modern ${sidebarOpen ? 'main-content-modern--sidebar-open' : ''}${darkMode ? ' dark' : ''}`}
        style={{
          minHeight: '70vh',
          height: 'auto',
          transition: 'margin-left 0.4s cubic-bezier(.4,0,.2,1), width 0.4s cubic-bezier(.4,0,.2,1)',
          marginLeft: sidebarOpen ? 320 : 0,
          width: sidebarOpen ? 'calc(100vw - 320px)' : '100vw',
        }}
      >
        <main className={`container main-content-full main-content-padded-fix${darkMode ? ' dark' : ''}`}>
          <header className={`header${darkMode ? ' dark' : ''}`}>
            <div className="brand">AI Bootcamp Tutor</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button onClick={toggleLang} className="btn">{i18n.language === 'en' ? 'AR' : 'EN'}</button>
              <button
                className={`btn-darkmode${darkMode ? ' active' : ''}`}
                onClick={() => setDarkMode((v) => !v)}
                aria-label="Toggle dark mode"
              >
                {darkMode ? '☀️ Light' : '🌙 Dark'}
              </button>
            </div>
          </header>
          <section className="main-section-full main-section-centered-fix">
            <div className="main-col-full main-col-centered-fix">
              <TextInputArea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={t('features.summarize.placeholder')}
              />

              <FeatureSelector selectedFeature={feature} onFeatureChange={setFeature} />

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', width: '100%' }}>
                <button onClick={handleSubmit} className="btn btn-primary" style={{ flex: 1 }}>
                  {feature === 'summarize' ? t('features.summarize.button') :
                   feature === 'explain' ? t('features.explain.button') :
                   t('features.exercises.button')}
                </button>
                <button onClick={() => { setText(''); setResult(null); setError(null); }} className="btn btn-clear" style={{ flex: 1 }}>Clear</button>
              </div>

              {loading && <LoadingSpinner message={t('common.loading')} />}

              {error && <ErrorDisplay error={error} onRetry={handleSubmit} />}

              {result && result.type === 'summary' && <SummaryResult summary={result.payload.summary || ''} />}

              {result && result.type === 'explain' && (
                <ExplanationResult
                  arabicExplanation={result.payload.arabic_explanation}
                  englishExplanation={result.payload.english_explanation}
                />
              )}

              {result && result.type === 'exercises' && <ExercisesResult exercises={result.payload.exercises || []} />}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

