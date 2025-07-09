"use client";

import Image from "next/image";
import { useCandidates } from "../../lib/context/CandidateContext";
import { motion } from "framer-motion";

const CandidateCard = ({ candidate }) => {
  const { setSelectedCandidate } = useCandidates();

  // Helper to determine notice period text
  const getNoticePeriodText = () => {
    if (
      typeof candidate.notice_period_weeks === "number" &&
      candidate.notice_period_weeks > 0
    ) {
      return `${candidate.notice_period_weeks} weeks notice`;
    }
    return "available";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 60 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="bg-card rounded-lg p-6 shadow-sm border border-border hover:shadow-md transition-all duration-200 cursor-pointer hover:border-primary/50 animate-slide-up group relative h-[240px]"
      onClick={() => setSelectedCandidate(candidate)}
    >
      {/* Header (no avatar) */}
      <div className="mb-4">
        <h3 className="font-semibold text-card-foreground text-lg mb-1 truncate group-hover:text-primary transition-colors">
          {candidate.name}
        </h3>
        <p className="text-muted-foreground text-sm mb-2 truncate">
          {candidate.title}
        </p>
        <div className="flex items-center text-xs text-muted-foreground space-x-4">
          <span>📍 {candidate.location}</span>
          <span>💼 {candidate.experience} years</span>
        </div>
      </div>

      {/* Skills */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {candidate.skills.slice(0, 4).map((skill, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
            >
              {skill}
            </span>
          ))}
          {candidate.skills.length > 4 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
              +{candidate.skills.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Footer - Positioned lower */}
      <div className="absolute bottom-4 left-6 right-6 flex justify-between items-center pt-4 border-t border-border">
        <div className="text-lg font-semibold text-card-foreground">
          ${candidate.salary.toLocaleString()}
          <span className="text-xs text-muted-foreground font-normal">
            /year
          </span>
        </div>
        <div
          className={`text-xs px-2 py-1 rounded-full font-medium ${
            typeof candidate.notice_period_weeks === "number" &&
            candidate.notice_period_weeks > 0
              ? "bg-chart-4/10 text-chart-4 border border-chart-4/20"
              : "bg-chart-1/10 text-chart-1 border border-chart-1/20"
          }`}
        >
          {getNoticePeriodText()}
        </div>
      </div>
    </motion.div>
  );
};

export default CandidateCard;
