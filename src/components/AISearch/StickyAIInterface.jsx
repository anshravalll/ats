'use client';

import { useState, useEffect, useCallback } from 'react';
import { useChat } from 'ai/react';
import { Sparkles, MessageCircle, Maximize2, X } from 'lucide-react';
import { MessageInput } from '@/components/ui/message-input';
import { Button } from '@/components/ui/button';
import { useCandidates } from '../../../lib/context/CandidateContext';
import { cn } from '@/lib/utils';
import ExpandedChatInterface from './ExpandedChatInterface';

const StickyAIInterface = () => {
  const [isSticky, setIsSticky] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isManuallyHidden, setIsManuallyHidden] = useState(false);
  const [useMockAPI, setUseMockAPI] = useState(false);
  
  const { filteredCandidates, applyAIFilters, candidates } = useCandidates();

  // Initialize API settings
  useEffect(() => {
    const envUseMock = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';
    const localUseMock = typeof window !== 'undefined' 
      ? localStorage.getItem('ats-use-mock-api') === 'true'
      : false;
    
    setUseMockAPI(envUseMock || localUseMock);
  }, []);

  const toggleMockAPI = useCallback(() => {
    const newUseMock = !useMockAPI;
    setUseMockAPI(newUseMock);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('ats-use-mock-api', newUseMock.toString());
    }
  }, [useMockAPI]);

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
    // api: apiEndpoint, // Keep commented as requested
    onError: (error) => {
      console.log("AI API Error:", error);
    },
    onFinish: (message) => {
      // This processes AI response and filters candidates directly
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

  // Windows + Enter keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Check for Windows key (Meta key on Mac, Windows key on PC) + Enter
      if ((event.metaKey || event.key === 'Meta') && event.key === 'Enter') {
        event.preventDefault();
        if (input.trim() && !isLoading) {
          // Trigger form submission
          const form = document.querySelector('form');
          if (form) {
            form.requestSubmit();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [input, isLoading]);

  // Sticky scroll detection
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
  }, []);

  const handleSuggestionClick = useCallback((suggestion) => {
    if (!isLoading) {
      append({ role: 'user', content: suggestion });
    }
  }, [append, isLoading]);

  // Mock suggestions
  const mockSuggestions = [
    "Find React developers in Germany with 5+ years experience",
    "Show senior candidates available immediately", 
    "Which candidates know both Python and AWS?"
  ];

  return (
    <>
      {/* Minimal Sticky AI Bar */}
      <div className={cn(
        "transition-all duration-500 ease-out",
        isSticky 
          ? "fixed top-4 left-1/2 transform -translate-x-1/2 z-40 w-[90%] max-w-2xl" 
          : "relative w-full max-w-4xl mx-auto"
      )}>
        
        {/* Glow Effect */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-r from-primary/20 via-chart-1/30 to-primary/20 rounded-2xl blur-xl transition-all duration-700",
          isSticky ? "opacity-80 scale-105" : "opacity-40 scale-100"
        )} />
        
        {/* Main Interface */}
        <div className={cn(
          "relative bg-card/95 backdrop-blur-xl border border-border/60 rounded-2xl shadow-lg transition-all duration-500",
          isSticky ? "shadow-primary/20 border-primary/30" : "shadow-md"
        )}>
          
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-border/30">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-primary to-chart-1 rounded-lg flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-primary-foreground" />
              </div>
              <span className="text-sm font-medium text-card-foreground">AI Search</span>
              <span className="text-xs text-muted-foreground">
                {filteredCandidates.length} candidates
              </span>
              {useMockAPI && (
                <span className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-2 py-0.5 rounded-full font-medium">
                  MOCK
                </span>
              )}
              {/* Loading indicator when collapsed */}
              {isLoading && !isExpanded && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-75" />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-150" />
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleExpand}
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                >
                  <MessageCircle className="w-4 h-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm" 
                onClick={handleExpand}
                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Input Section - Using MessageInput Properly */}
          <div className="p-4">
            <form onSubmit={handleSubmit}>
              <MessageInput
                value={input}
                onChange={handleInputChange}
                placeholder={`Ask AI to find candidates... ${useMockAPI ? '(Use buttons below)' : ''}`}
                className={cn(
                  "min-h-[44px] bg-background/60 border-border/60 focus:border-primary/60 text-sm",
                  isLoading && "text-muted-foreground bg-muted/30" // Gray out during processing
                )}
                // Key MessageInput props
                submitOnEnter={true}
                stop={stop}
                isGenerating={isLoading}
                enableInterrupt={true}
                // Optional: Add voice input if you have transcribeAudio function
                // transcribeAudio={transcribeAudio}
              />
            </form>

            {/* Mock Suggestions */}
            {useMockAPI && (
              <div className="mt-2 flex flex-wrap gap-1">
                {mockSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors border border-yellow-200 dark:border-yellow-800 disabled:opacity-50"
                    disabled={isLoading}
                    title={suggestion}
                  >
                    {suggestion.length > 30 ? suggestion.substring(0, 30) + '...' : suggestion}
                  </button>
                ))}
              </div>
            )}

            {/* Status Info */}
            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
              <span>
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    AI is processing...
                    {useMockAPI && <span className="text-yellow-600">(Mock)</span>}
                  </span>
                ) : (
                  <span>
                    Press <span className="font-mono bg-muted px-1 rounded">⊞ + Enter</span> or <span className="font-mono bg-muted px-1 rounded">Enter</span> to send
                    {useMockAPI && <span className="ml-2 text-yellow-600">or click buttons above</span>}
                  </span>
                )}
              </span>
              {filteredCandidates.length !== candidates.length && (
                <span className="text-primary font-medium">
                  Filtered from {candidates.length} total
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

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
          useMockAPI={useMockAPI}
          suggestions={mockSuggestions}
          toggleMockAPI={toggleMockAPI}
        />
      )}
    </>
  );
};

export default StickyAIInterface;
