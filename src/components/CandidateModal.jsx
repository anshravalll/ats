'use client';

import { useEffect } from 'react';
import { useCandidates } from '../../lib/context/CandidateContext';

const CandidateModal = () => {
  const { selectedCandidate, setSelectedCandidate } = useCandidates();

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (selectedCandidate && typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [selectedCandidate]);

  if (!selectedCandidate) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-lg border border-border">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-card-foreground">Candidate Details</h2>
          <button 
            onClick={() => setSelectedCandidate(null)}
            className="text-muted-foreground hover:text-foreground text-xl transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <img
              src={selectedCandidate.avatar}
              alt={selectedCandidate.name}
              className="w-20 h-20 rounded-full object-cover ring-2 ring-border"
            />
            <div>
              <h3 className="text-xl font-semibold text-card-foreground">{selectedCandidate.name}</h3>
              <p className="text-muted-foreground">{selectedCandidate.title}</p>
              <p className="text-sm text-muted-foreground">📍 {selectedCandidate.location}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-card-foreground mb-2">Contact Information</h4>
              <p className="text-sm text-muted-foreground">✉️ {selectedCandidate.email}</p>
              <p className="text-sm text-muted-foreground">📞 {selectedCandidate.phone}</p>
            </div>

            <div>
              <h4 className="font-semibold text-card-foreground mb-2">Experience & Salary</h4>
              <p className="text-sm text-muted-foreground">💼 {selectedCandidate.experience} years experience</p>
              <p className="text-sm text-muted-foreground">💰 ${selectedCandidate.salary.toLocaleString()}/year</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-card-foreground mb-3">Skills</h4>
            <div className="flex flex-wrap gap-2">
              {selectedCandidate.skills.map((skill, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-card-foreground mb-2">Availability</h4>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              selectedCandidate.availability === 'Available' 
                ? 'bg-chart-1/10 text-chart-1 border border-chart-1/20' 
                : 'bg-chart-4/10 text-chart-4 border border-chart-4/20'
            }`}>
              {selectedCandidate.availability}
            </span>
          </div>

          <div className="flex space-x-4 pt-4 border-t border-border">
            <button className="btn btn-primary flex-1">Contact Candidate</button>
            <button className="btn btn-outline">Save to Favorites</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateModal;
