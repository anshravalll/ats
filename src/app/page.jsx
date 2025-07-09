'use client';

import { useEffect, useState } from 'react';
import { CandidateProvider, useCandidates } from '../../lib/context/CandidateContext';
import StickyAIInterface from '../components/AISearch/StickyAIInterface';
import CandidateCard from '../components/CandidateCard';
import CandidateModal from '../components/CandidateModal';

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check localStorage and system preference on mount
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme');
      const systemPrefers = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const shouldBeDark = stored === 'dark' || (!stored && systemPrefers);
      
      setIsDark(shouldBeDark);
      document.documentElement.classList.toggle('dark', shouldBeDark);
    }
  }, []);

  const toggleTheme = () => {
    if (typeof window !== 'undefined') {
      const newTheme = !isDark;
      setIsDark(newTheme);
      document.documentElement.classList.toggle('dark', newTheme);
      localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="btn btn-outline"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
};

const LoadingState = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 mx-auto mb-4 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      <h2 className="text-2xl font-semibold text-foreground mb-2">Loading candidates...</h2>
      <p className="text-muted-foreground">Please wait while we fetch the candidate data.</p>
    </div>
  </div>
);

const ErrorState = ({ error, onRetry }) => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center max-w-md">
      <div className="text-destructive text-6xl mb-4">⚠️</div>
      <h2 className="text-2xl font-semibold text-foreground mb-2">Error loading candidates</h2>
      <p className="text-muted-foreground mb-4">{error}</p>
      <button onClick={onRetry} className="btn btn-primary">
        Retry
      </button>
    </div>
  </div>
);

const EmptyState = ({ hasFilters = false }) => (
  <div className="text-center py-16">
    <div className="text-6xl mb-4">
      {hasFilters ? '🔍' : '🤖'}
    </div>
    <h3 className="text-2xl font-semibold text-foreground mb-2">
      {hasFilters ? 'No candidates match your AI search' : 'Use AI to find candidates'}
    </h3>
    <p className="text-muted-foreground">
      {hasFilters 
        ? 'Try refining your search or ask the AI differently.'
        : 'Type in the AI search bar above to find specific candidates using natural language.'
      }
    </p>
  </div>
);

const MainContent = () => {
  const { 
    filteredCandidates, 
    candidates,
    searchTerm,
    locationFilter, 
    experienceFilter,
    lastAIQuery,
    isLoading, 
    error, 
    loadCandidates 
  } = useCandidates();

  useEffect(() => {
    loadCandidates();
  }, [loadCandidates]);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={loadCandidates} />;

  // Enhanced empty state logic
  const hasFiltersApplied = searchTerm || locationFilter || experienceFilter || lastAIQuery;
  const hasNoCandidates = candidates.length === 0;
  const hasNoFilteredResults = filteredCandidates.length === 0 && !hasNoCandidates;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between relative">
            {/* Theme toggle on the left */}
            <div className="flex items-center justify-start w-12">
              <ThemeToggle />
            </div>
            {/* Centered title and subtitle */}
            <div className="flex-1 text-center">
              <h1 className="text-5xl font-bold text-foreground mb-4 bg-gradient-to-r from-primary via-chart-1 to-primary bg-clip-text text-transparent">
                ATS-Lite
              </h1>
              <p className="text-xl text-muted-foreground">
                AI-powered candidate discovery & recruitment
              </p>
            </div>
            {/* Right spacer for symmetry */}
            <div className="w-12" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Minimal Sticky AI Interface */}
        <StickyAIInterface />

        {/* Results Summary */}
        {candidates.length > 0 && (
          <div className="mt-8 mb-6 text-center">
            <div className="inline-flex items-center gap-4 px-6 py-3 bg-card/50 backdrop-blur-sm border border-border/50 rounded-full">
              <span className="text-sm text-muted-foreground">
                Showing <strong className="text-foreground">{filteredCandidates.length}</strong> of <strong className="text-foreground">{candidates.length}</strong> candidates
              </span>
              {lastAIQuery && (
                <>
                  <div className="w-1 h-1 bg-muted-foreground rounded-full" />
                  <span className="text-sm text-primary font-medium">
                    AI Search: "{lastAIQuery}"
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Candidate Results Grid */}
        <div className="mt-12">
          {filteredCandidates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
              {filteredCandidates.map((candidate) => (
                <CandidateCard key={candidate.id} candidate={candidate} />
              ))}
            </div>
          ) : (
            <EmptyState hasFilters={hasFiltersApplied} />
          )}
        </div>

        {/* Additional Info Section */}
        {filteredCandidates.length > 0 && (
          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-chart-1 rounded-full animate-pulse" />
              <span>Results updated in real-time by AI</span>
            </div>
          </div>
        )}
      </main>

      {/* Candidate Modal */}
      <CandidateModal />
    </div>
  );
};

export default function Home() {
  return (
    <CandidateProvider>
      <MainContent />
    </CandidateProvider>
  );
}
