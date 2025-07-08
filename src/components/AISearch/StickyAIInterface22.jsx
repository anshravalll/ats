'use client';

import { useState, useEffect, useCallback } from 'react';
import { Sparkles, MessageCircle, Maximize2, X } from 'lucide-react';
import { MessageInput } from '@/components/ui/message-input';
import { Button } from '@/components/ui/button';
import { useCandidates } from '../../../lib/context/CandidateContext';
import { useMCPWorkflow } from '../../hooks/use-mcp-workflow';
import { cn } from '@/lib/utils';
import ExpandedChatInterface from './ExpandedChatInterface';

const StickyAIInterface = () => {
  const [isSticky, setIsSticky] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isManuallyHidden, setIsManuallyHidden] = useState(false);
  
  const { filteredCandidates, applyAIFilters, candidates } = useCandidates();
  
  // Use custom MCP workflow hook
  const { 
    messages,
    input,
    handleInputChange,
    isLoading,
    stop,
    append,
    executeMCPWorkflow,
    currentPhase,
    isProcessingMCP,
    mcpResults,
    mcpError,
    getPhaseMessage,
    resetMCPWorkflow
  } = useMCPWorkflow();

  // Handle form submission with MCP workflow
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    // Execute the complete MCP workflow
    executeMCPWorkflow(input, candidates, applyAIFilters);
  }, [input, isLoading, candidates, executeMCPWorkflow, applyAIFilters]);

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
    resetMCPWorkflow();
  }, [resetMCPWorkflow]);

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
              <span className="text-sm font-medium text-card-foreground">MCP AI Search</span>
              <span className="text-xs text-muted-foreground">
                {filteredCandidates.length} candidates
              </span>
              
              {/* Enhanced phase indicator */}
              {isLoading && (
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-75" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-150" />
                  </div>
                  {currentPhase && (
                    <span className="text-xs text-primary font-medium">
                      {currentPhase}
                    </span>
                  )}
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

          {/* Input Section */}
          <div className="p-4">
            <form onSubmit={handleSubmit}>
              <MessageInput
                value={input}
                onChange={handleInputChange}
                placeholder="Describe the candidates you're looking for..."
                className={cn(
                  "min-h-[44px] bg-background/60 border-border/60 focus:border-primary/60 text-sm",
                  isLoading && "text-muted-foreground bg-muted/30"
                )}
                submitOnEnter={true}
                stop={stop}
                isGenerating={isLoading}
                enableInterrupt={true}
              />
            </form>

            {/* Status Info with MCP phase details */}
            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
              <span>
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    {getPhaseMessage()}
                  </span>
                ) : mcpError ? (
                  <span className="text-destructive">Error: {mcpError}</span>
                ) : mcpResults ? (
                  <span className="text-green-600">✅ Search completed - {mcpResults.filteredCount} candidates found</span>
                ) : (
                  'Press Enter to start MCP workflow (THINK → ACT → SPEAK)'
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
        />
      )}
    </>
  );
};

export default StickyAIInterface;
