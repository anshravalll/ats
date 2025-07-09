'use client';

import { useState, useCallback, useRef } from 'react';
import { useChat } from 'ai/react';

export function useMCPWorkflow() {
  const [isProcessingMCP, setIsProcessingMCP] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(null);
  const [mcpResults, setMcpResults] = useState(null);
  const [mcpError, setMcpError] = useState(null);
  const [csvSent, setCsvSent] = useState(false);
  
  // useChat hook for final SPEAK phase display only
  const {
    messages,
    input,
    handleInputChange,
    isLoading: chatLoading,
    append,
    stop: chatStop
  } = useChat({
    // No API endpoint - we control the flow manually
    onFinish: (message) => {
      // This only triggers when we manually add the final SPEAK response
    }
  });

  // Execute complete MCP workflow: THINK → ACT → SPEAK
  const executeMCPWorkflow = useCallback(async (userMessage, candidates, applyAIFilters) => {
    if (!userMessage.trim() || isProcessingMCP || candidates.length === 0) return;
    
    setIsProcessingMCP(true);
    setMcpError(null);
    setMcpResults(null);
    
    try {
      // Add user message to chat immediately (visible to user)
      const userMsg = {
        role: 'user',
        content: userMessage,
        data: !csvSent ? {
          candidates: JSON.stringify(candidates),
          fields: Object.keys(candidates[0] || {}).join(', ')
        } : undefined
      };
      
      append(userMsg);
      
      if (!csvSent) {
        setCsvSent(true);
      }

      // PHASE 1: THINK (Hidden from user)
      setCurrentPhase('THINK');
      
      // In your useMCPWorkflow hook - replace the THINK phase call
      const thinkResponse = await fetch('/api/chat/think', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: userMessage,
            data: {
              candidates: JSON.stringify(candidates),
              fields: Object.keys(candidates[0] || {}).join(', ')
            }
          }]
        })
      });
      
      const thinkResult = await thinkResponse.json();
      if (!thinkResult.success) throw new Error(thinkResult.error);
      

      // PHASE 2: ACT (Hidden from user, client-side processing)
      setCurrentPhase('ACT');
      
      // Import MCP tools dynamically
      const { filterCandidates, rankCandidates } = await import('../lib/mcp-tools');
      
      // Filter candidates based on THINK output
      const filteredCandidates = filterCandidates(thinkResult.data.filter, candidates);
      
      // Rank filtered candidates
      const rankedCandidates = rankCandidates(filteredCandidates, thinkResult.data.rank);
      const topCandidates = rankedCandidates.slice(0, 5);
      

      // PHASE 3: SPEAK (Will be visible to user)
      setCurrentPhase('SPEAK');
      
      const speakResponse = await fetch('/api/chat/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userQuery: userMessage,
          topCandidates: topCandidates,
          filteredCount: filteredCandidates.length,
          totalCount: candidates.length
        })
      });
      
      if (!speakResponse.ok) throw new Error('SPEAK phase failed');
      
      // Stream the SPEAK response and display it
      const reader = speakResponse.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        assistantMessage += chunk;
      }
      
      // Add assistant response to chat (visible to user)
      const aiMessage = {
        role: 'assistant',
        content: assistantMessage,
        data: {
          candidateIds: topCandidates.map(c => c.id),
          filteredCount: filteredCandidates.length,
          totalCount: candidates.length
        }
      };
      
      append(aiMessage);
      
      // Apply candidate filters to UI
      applyAIFilters(topCandidates.map(c => c.id), userMessage);
      
      // Store results for reference
      setMcpResults({
        summary: assistantMessage,
        topCandidates,
        filteredCount: filteredCandidates.length,
        totalCount: candidates.length,
        plans: thinkResult.data
      });
      
      
    } catch (error) {
      console.error('❌ MCP workflow failed:', error);
      setMcpError(error.message);
      
      // Add error message to chat
      append({
        role: 'assistant',
        content: `Sorry, I encountered an error while processing your request: ${error.message}. Please try again.`
      });
    } finally {
      setIsProcessingMCP(false);
      setCurrentPhase(null);
    }
  }, [append, csvSent, isProcessingMCP]);

  // Enhanced stop function
  const stopMCPWorkflow = useCallback(() => {
    setIsProcessingMCP(false);
    setCurrentPhase(null);
    chatStop?.();
  }, [chatStop]);

  // Reset function
  const resetMCPWorkflow = useCallback(() => {
    setMcpResults(null);
    setMcpError(null);
    setIsProcessingMCP(false);
    setCurrentPhase(null);
    setCsvSent(false);
  }, []);

  // Get phase-specific loading message
  const getPhaseMessage = useCallback(() => {
    switch (currentPhase) {
      case 'THINK': return '🧠 AI is analyzing your request...';
      case 'ACT': return '🔍 Filtering and ranking candidates...';
      case 'SPEAK': return '💬 Generating summary...';
      default: return 'Processing...';
    }
  }, [currentPhase]);

  // Combined loading state (MCP processing OR chat loading)
  const isLoading = isProcessingMCP || chatLoading;

  return {
    // Chat interface state
    messages,
    input,
    handleInputChange,
    isLoading,
    stop: stopMCPWorkflow,
    append,
    
    // MCP-specific state
    executeMCPWorkflow,
    currentPhase,
    isProcessingMCP,
    mcpResults,
    mcpError,
    getPhaseMessage,
    resetMCPWorkflow,
    
    // CSV state
    csvSent
  };
}
