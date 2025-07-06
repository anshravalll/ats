'use client';

import Image from 'next/image';
import { useCandidates } from '../../lib/context/CandidateContext';

const CandidateCard = ({ candidate }) => {
  const { setSelectedCandidate } = useCandidates();

  return (
    <div 
      className="bg-card rounded-lg p-6 shadow-sm border border-border hover:shadow-md transition-all duration-200 cursor-pointer hover:border-primary/50 animate-slide-up group"
      onClick={() => setSelectedCandidate(candidate)}
    >
      {/* Header */}
      <div className="flex items-start space-x-4 mb-4">
        <div className="relative flex-shrink-0">
          <Image
            src={candidate.avatar}
            alt={candidate.name}
            width={60}
            height={60}
            className="rounded-full object-cover ring-2 ring-border group-hover:ring-primary/50 transition-all duration-200"
          />
          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card ${
            candidate.availability === 'Available' 
              ? 'bg-chart-1' 
              : 'bg-chart-4'
          }`}></div>
        </div>
        
        <div className="flex-1 min-w-0">
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

      {/* Footer */}
      <div className="flex justify-between items-center pt-4 border-t border-border">
        <div className="text-lg font-semibold text-card-foreground">
          ${candidate.salary.toLocaleString()}
          <span className="text-xs text-muted-foreground font-normal">/year</span>
        </div>
        
        <div className={`text-xs px-2 py-1 rounded-full font-medium ${
          candidate.availability === 'Available' 
            ? 'bg-chart-1/10 text-chart-1 border border-chart-1/20' 
            : 'bg-chart-4/10 text-chart-4 border border-chart-4/20'
        }`}>
          {candidate.availability}
        </div>
      </div>
    </div>
  );
};

export default CandidateCard;
