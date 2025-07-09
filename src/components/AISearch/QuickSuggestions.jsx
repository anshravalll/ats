"use client";

import { useState } from "react";
import { Sparkles, MapPin, Award, Code } from "lucide-react";

const quickSuggestions = [
  {
    icon: <Code className="w-4 h-4" />,
    text: "Find React developers in Germany",
    query:
      "Show me React developers located in Germany with 3+ years experience",
  },
  {
    icon: <Award className="w-4 h-4" />,
    text: "Senior candidates available now",
    query:
      "Find senior developers with 7+ years experience who are available immediately",
  },
  {
    icon: <MapPin className="w-4 h-4" />,
    text: "Remote-friendly candidates",
    query: "Show candidates who are open to remote work across all locations",
  },
  {
    icon: <Sparkles className="w-4 h-4" />,
    text: "Full-stack with Python",
    query:
      "Find full-stack developers who know Python and have database experience",
  },
];

const QuickSuggestions = ({ onSuggestionClick }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <div className="mt-4 space-y-2">
      <p className="text-xs text-muted-foreground font-medium">
        Quick searches:
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {quickSuggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion.query)}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            className={`flex items-center gap-2 p-2 text-left text-sm rounded-lg border border-border/50 transition-all duration-200 ${
              hoveredIndex === index
                ? "bg-primary/10 border-primary/50 text-primary shadow-sm"
                : "bg-secondary/30 hover:bg-secondary/50 text-muted-foreground"
            }`}
          >
            <div
              className={`transition-colors ${hoveredIndex === index ? "text-primary" : "text-muted-foreground"}`}
            >
              {suggestion.icon}
            </div>
            <span className="truncate">{suggestion.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickSuggestions;
