'use client';

import { useState, useEffect, useCallback } from 'react';
import { useChat } from 'ai/react';
import { Sparkles, MessageCircle, Maximize2, X, Settings } from 'lucide-react';
import { MessageInput } from '@/components/ui/message-input';
import { TypingIndicator } from '@/components/ui/typing-indicator';
import { Button } from '@/components/ui/button';
import { useCandidates } from '../../../lib/context/CandidateContext';
import { cn } from '@/lib/utils';
import ExpandedChatInterface from './ExpandedChatInterface';

const StickyAIInterface = () => {
  const [isSticky, setIsSticky] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isManuallyHidden, setIsManuallyHidden] = useState(false);
  const [showSettings, setShowSettings] = useState(false); // Settings panel state
  const [useMockAPI, setUseMockAPI] = useState(false); // Mock API toggle state
  
  const { filteredCandidates, applyAIFilters, candidates } = useCandidates();

  // Initialize API settings from environment and localStorage
  useEffect(() => {
    const envUseMock = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';
    const localUseMock = typeof window !== 'undefined' 
      ? localStorage.getItem('ats-use-mock-api') === 'true'
      : false;
    
    setUseMockAPI(envUseMock || localUseMock);
  }, []);

  // Toggle mock API and save to localStorage
  const toggleMockAPI = useCallback(() => {
    const newUseMock = !useMockAPI;
    setUseMockAPI(newUseMock);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('ats-use-mock-api', newUseMock.toString());
    }
  }, [useMockAPI]);

  // Determine API endpoint based on mock setting
  const apiEndpoint = useMockAPI ? '/api/chat/candidates-mock' : '/api/chat/candidates';

  const { 
    messages, 
    input, 
    handleInputChange, 
    handleSubmit, 
    isLoading,
    stop,
    append
  } = useChat({
    api: apiEndpoint, // Dynamic API endpoint
    onFinish: (message) => {
      // Parse AI response for candidate filtering
      try {
        const jsonMatch = message.content.match(/\{[^}]*"candidateIds"[^}]*\}/);
        if (jsonMatch) {
          const result = JSON.parse(jsonMatch[0]);
          if (result.candidateIds && Array.isArray(result.candidateIds)) {
            applyAIFilters(result.candidateIds, input);
          }
        }
      } catch (e) {
        console.error('Error parsing AI response:', e);
      }
    }
  });

  // Updated sticky scroll detection with manual hide logic
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const shouldBeSticky = scrollTop > 250;
      
      if (isManuallyHidden) {
        if (scrollTop <= 100) {
          setIsManuallyHidden(false);
        }
        setIsSticky(false);
      } else {
        setIsSticky(shouldBeSticky);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isManuallyHidden]);

  const handleExpand = useCallback(() => {
    setIsExpanded(true);
  }, []);

  const handleCollapse = useCallback(() => {
    setIsExpanded(false);
  }, []);

  const handleClose = useCallback(() => {
    setIsManuallyHidden(true);
    setIsSticky(false);
    setIsExpanded(false);
    setShowSettings(false); // Close settings when closing the interface
  }, []);

  // Settings Panel Component
  const SettingsPanel = () => (
    showSettings && (
      <div className="absolute top-full right-0 mt-2 bg-card border border-border rounded-lg shadow-lg p-4 z-50 min-w-56">
        <h4 className="font-medium text-card-foreground mb-3 flex items-center gap-2">
          <Settings className="w-4 h-4" />
          API Settings
        </h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Use Mock API</span>
            <button
              onClick={toggleMockAPI}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                useMockAPI ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                useMockAPI ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>
          <div className="text-xs text-muted-foreground">
            {useMockAPI ? (
              <div className="space-y-1">
                <p className="text-yellow-600 font-medium">🧪 Using mock responses for testing</p>
                <p>Try queries like "React developers in Germany"</p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-green-600 font-medium">🚀 Using real OpenAI API</p>
                <p>Requires valid API key and credits</p>
              </div>
            )}
          </div>
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Current endpoint: 
              <code className="ml-1 px-1 py-0.5 bg-muted rounded text-xs">
                {apiEndpoint}
              </code>
            </p>
          </div>
        </div>
      </div>
    )
  );

  return (
    <>
      {/* Minimal Sticky AI Bar */}
      <div className={cn(
        "transition-all duration-500 ease-out",
        isSticky 
          ? "fixed top-4 left-1/2 transform -translate-x-1/2 z-40 w-[90%] max-w-2xl" 
          : "relative w-full max-w-4xl mx-auto"
      )}>
        
        {/* Subtle Glow Effect */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-r from-primary/20 via-chart-1/30 to-primary/20 rounded-2xl blur-xl transition-all duration-700",
          isSticky ? "opacity-80 scale-105" : "opacity-40 scale-100"
        )} />
        
        {/* Main Minimal Interface */}
        <div className={cn(
          "relative bg-card/95 backdrop-blur-xl border border-border/60 rounded-2xl shadow-lg transition-all duration-500",
          isSticky ? "shadow-primary/20 border-primary/30" : "shadow-md"
        )}>
          
          {/* Compact Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-border/30">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-primary to-chart-1 rounded-lg flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-primary-foreground" />
              </div>
              <span className="text-sm font-medium text-card-foreground">AI Search</span>
              <span className="text-xs text-muted-foreground">
                {filteredCandidates.length} candidates
              </span>
              {/* Mock API Indicator */}
              {useMockAPI && (
                <span className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-2 py-0.5 rounded-full font-medium">
                  MOCK
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-1 relative">
              {messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleExpand}
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                  title="View chat history"
                >
                  <MessageCircle className="w-4 h-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm" 
                onClick={handleExpand}
                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                title="Expand chat interface"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                className={cn(
                  "h-7 w-7 p-0 text-muted-foreground hover:text-foreground",
                  showSettings && "bg-muted text-foreground"
                )}
                title="API settings"
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                title="Close AI interface"
              >
                <X className="w-4 h-4" />
              </Button>
              
              {/* Settings Panel */}
              <SettingsPanel />
            </div>
          </div>

          {/* Minimal Input Section */}
          <div className="p-4">
            <div className="relative">
              <MessageInput
                placeholder={`Ask AI to find candidates... ${useMockAPI ? '(Mock Mode - Try "React developers in Germany")' : ''}`}
                value={input}
                onChange={handleInputChange}
                onSubmit={handleSubmit}
                className="min-h-[44px] bg-background/60 border-border/60 focus:border-primary/60 text-sm pr-12"
                disabled={isLoading}
              />
              
              {/* Loading Indicator */}
              {isLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <TypingIndicator />
                </div>
              )}
            </div>

            {/* Quick Status */}
            {(isLoading || input) && (
              <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-2">
                  {isLoading ? (
                    <>
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                      AI is searching...
                      {useMockAPI && <span className="text-yellow-600">(Mock)</span>}
                    </>
                  ) : (
                    'Press Enter to search'
                  )}
                </span>
                {filteredCandidates.length !== candidates.length && (
                  <span className="text-primary font-medium">
                    Filtered from {candidates.length} total
                  </span>
                )}
              </div>
            )}

            {/* Mock Mode Quick Suggestions */}
            {useMockAPI && messages.length === 0 && (
              <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-xs text-yellow-700 dark:text-yellow-300 font-medium mb-1">
                  🧪 Mock Mode - Try these test queries:
                </p>
                <div className="flex flex-wrap gap-1">
                  {[
                    "React developers in Germany",
                    "Senior candidates", 
                    "Python AWS developers"
                  ].map((query, index) => (
                    <button
                      key={index}
                      onClick={() => append({ role: 'user', content: query })}
                      className="text-xs bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded hover:bg-yellow-200 dark:hover:bg-yellow-700 transition-colors"
                    >
                      {query}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Spacer when sticky */}
      {isSticky && <div className="h-20" />}

      {/* Expanded Chat Interface */}
      {isExpanded && (
        <ExpandedChatInterface
          messages={messages}
          input={input}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          stop={stop}
          append={append}
          onCollapse={handleCollapse}
        />
      )}
    </>
  );
};

export default StickyAIInterface;
