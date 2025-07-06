'use client';

import { useState, useEffect, useRef } from 'react';
import { X, History, Trash2, Settings, Send } from 'lucide-react';
import { MessageList } from '@/components/ui/message-list';
import { MessageInput } from '@/components/ui/message-input';
import { PromptSuggestions } from '@/components/ui/prompt-suggestions';
import { TypingIndicator } from '@/components/ui/typing-indicator';
import { Button } from '@/components/ui/button';
import { CopyButton } from '@/components/ui/copy-button';
import { useCandidates } from '../../../lib/context/CandidateContext';

const ExpandedChatInterface = ({
  messages,
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  stop,
  append,
  onCollapse
}) => {
  const [showHistory, setShowHistory] = useState(false);
  const { filteredCandidates, candidates } = useCandidates();
  const chatEndRef = useRef(null);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Prompt suggestions for candidate search
  const suggestions = [
    "Find React developers in Germany with 5+ years experience",
    "Show senior candidates available immediately",
    "Which candidates know both Python and AWS?",
    "Find full-stack developers with database experience", 
    "Show candidates with salary expectations under 80k",
    "Find developers open to remote work",
    "Compare candidates by experience level",
    "Show me the most skilled JavaScript developers"
  ];

  const handleSuggestionClick = (suggestion) => {
    append({ role: 'user', content: suggestion });
  };

  const clearChatHistory = () => {
    // Implementation to clear chat history
    if (confirm('Clear all chat history?')) {
      // Add clear functionality
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-chart-1 rounded-xl flex items-center justify-center">
              <span className="text-lg">🤖</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-card-foreground">
                ATS-Lite AI Assistant
              </h2>
              <p className="text-sm text-muted-foreground">
                {filteredCandidates.length} of {candidates.length} candidates shown
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2"
            >
              <History className="w-4 h-4" />
              History
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearChatHistory}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCollapse}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Chat Content */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Chat History Sidebar */}
          {showHistory && (
            <div className="w-80 border-r border-border p-4 overflow-y-auto">
              <ChatHistoryPanel />
            </div>
          )}

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col">
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-chart-1 rounded-2xl flex items-center justify-center">
                    <span className="text-2xl">🤖</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-card-foreground mb-2">
                      AI Candidate Search
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Ask me to find candidates using natural language. I'll search through your database and show the best matches.
                    </p>
                  </div>
                  
                  {/* Prompt Suggestions */}
                  <div className="w-full max-w-2xl">
                    <PromptSuggestions
                      label="Try these searches:"
                      suggestions={suggestions}
                      onSuggestionClick={handleSuggestionClick}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <MessageList 
                    messages={messages}
                    renderMessage={(message, index) => (
                      <ChatMessage
                        key={index}
                        message={message}
                        isUser={message.role === 'user'}
                      />
                    )}
                  />
                  <div ref={chatEndRef} />
                </div>
              )}
              
              {/* Typing Indicator */}
              {isLoading && (
                <div className="flex items-center gap-2 mt-4">
                  <TypingIndicator />
                  <span className="text-sm text-muted-foreground">AI is searching candidates...</span>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="border-t border-border p-6">
              <MessageInput
                placeholder="Ask me to find specific candidates..."
                value={input}
                onChange={handleInputChange}
                onSubmit={handleSubmit}
                disabled={isLoading}
                className="min-h-[60px] bg-background/60 border-border/60 focus:border-primary/60"
              />
              
              {/* Quick Actions */}
              <div className="flex items-center justify-between mt-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span>💡 Tip: Try "Find React developers in Germany"</span>
                </div>
                <div className="flex items-center gap-2">
                  {isLoading ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={stop}
                      className="text-destructive hover:text-destructive"
                    >
                      Stop
                    </Button>
                  ) : (
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Enter</kbd>
                      to send
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Chat Message Component
const ChatMessage = ({ message, isUser }) => {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
        
        {/* Avatar */}
        <div className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
          }`}>
            {isUser ? '👤' : '🤖'}
          </div>
          
          {/* Message Bubble */}
          <div className={`px-4 py-2 rounded-2xl ${
            isUser 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted text-muted-foreground'
          }`}>
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            
            {/* Copy Button for AI messages */}
            {!isUser && (
              <div className="mt-2 flex justify-end">
                <CopyButton text={message.content} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Chat History Panel Component
const ChatHistoryPanel = () => {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-card-foreground">Recent Searches</h3>
      <div className="space-y-2">
        <div className="p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted/80 transition-colors">
          <p className="text-sm font-medium">React Developers</p>
          <p className="text-xs text-muted-foreground">Found 8 candidates</p>
        </div>
        <div className="p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted/80 transition-colors">
          <p className="text-sm font-medium">Senior Full-stack</p>
          <p className="text-xs text-muted-foreground">Found 12 candidates</p>
        </div>
        <div className="p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted/80 transition-colors">
          <p className="text-sm font-medium">Python + AWS</p>
          <p className="text-xs text-muted-foreground">Found 5 candidates</p>
        </div>
      </div>
    </div>
  );
};

export default ExpandedChatInterface;
