'use client';

import { useCandidates } from '../../lib/context/CandidateContext';
import { useDebounce } from '../../lib/utils/debounce';
import { useEffect, useState } from 'react';

const SearchControls = () => {
  const {
    searchTerm,
    locationFilter,
    experienceFilter,
    sortBy,
    isSearching,
    setSearchTerm,
    setLocationFilter,
    setExperienceFilter,
    setSortBy,
    clearFilters,
    getUniqueLocations,
    getTotalCandidates,
    filteredCandidates
  } = useCandidates();

  // Local state for immediate UI feedback
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const debouncedSearchTerm = useDebounce(localSearchTerm, 300);

  const uniqueLocations = getUniqueLocations();
  const totalCandidates = getTotalCandidates();

  // Apply debounced search
  useEffect(() => {
    if (debouncedSearchTerm !== searchTerm) {
      setSearchTerm(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, searchTerm, setSearchTerm]);

  // Sync local state with context state
  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  return (
    <div className="bg-card rounded-lg p-6 shadow-sm border border-border mb-6">
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search candidates by name, title, skills, or location..."
            value={localSearchTerm}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
            className="form-control w-full pl-10 pr-10 py-3 text-base"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
            🔍
          </div>
          {isSearching && <div className="search-loading"></div>}
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="form-control"
          >
            <option value="">All Locations</option>
            {uniqueLocations.map(location => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>

          <select
            value={experienceFilter}
            onChange={(e) => setExperienceFilter(e.target.value)}
            className="form-control"
          >
            <option value="">All Experience</option>
            <option value="junior">Junior (0-3 years)</option>
            <option value="mid">Mid (4-6 years)</option>
            <option value="senior">Senior (7+ years)</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="form-control"
          >
            <option value="name">Sort by Name</option>
            <option value="experience">Sort by Experience</option>
            <option value="salary">Sort by Salary</option>
          </select>

          <button onClick={clearFilters} className="btn btn-secondary">
            Clear Filters
          </button>
        </div>

        {/* Results Summary */}
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <span>
            {filteredCandidates.length} of {totalCandidates} candidates found
          </span>
          {searchTerm && (
            <span>
              Searching for: "<strong className="text-foreground">{searchTerm}</strong>"
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchControls;
