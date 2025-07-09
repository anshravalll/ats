"use client";

import { useState, useEffect, useRef } from "react";
import { X, History, Trash2 } from "lucide-react";
import { Chat } from "@/components/ui/chat";
import { Button } from "@/components/ui/button";
import { useCandidates } from "../../../lib/context/CandidateContext";

const ExpandedChatInterface = ({
  messages,
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  stop,
  append,
  onCollapse,
  useMockAPI,
  suggestions,
}) => {
  const [showHistory, setShowHistory] = useState(false);
  const { filteredCandidates, candidates } = useCandidates();

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.body.style.overflow = "hidden";

      return () => {
        document.body.style.overflow = "unset";
      };
    }
  }, []);

  const clearChatHistory = () => {
    if (confirm("Clear all chat history?")) {
      // Implementation to clear chat history
      window.location.reload(); // Simple approach for now
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-chart-1 rounded-xl flex items-center justify-center">
              <span className="text-lg">🤖</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-card-foreground">
                ATS-Lite AI Assistant
              </h2>
              <p className="text-sm text-muted-foreground">
                {filteredCandidates.length} of {candidates.length} candidates
                shown
                {useMockAPI && (
                  <span className="text-yellow-600 ml-2">(Mock Mode)</span>
                )}
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
              {/* <History className="w-4 h-4" />
              History */}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearChatHistory}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onCollapse}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Chat Content - This is the key container */}
        <div className="flex-1 flex min-h-0">
          {/* Chat History Sidebar */}
          {showHistory && (
            <div className="w-80 border-r border-border p-4 overflow-y-auto flex-shrink-0">
              <ChatHistoryPanel />
            </div>
          )}

          {/* Main Chat Area - Added px-4 for left and right spacing */}
          <div className="flex-1 min-h-0 px-4">
            <Chat
              messages={messages}
              handleSubmit={handleSubmit}
              input={input}
              handleInputChange={handleInputChange}
              isGenerating={isLoading}
              stop={stop}
              append={append}
              className="h-full w-full"
              placeholder="Ask me to find specific candidates..."
            />
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
