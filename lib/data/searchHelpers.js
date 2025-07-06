/**
 * Search and filter utility functions
 */

/**
 * Filters candidates by search term
 * @param {Array} candidates - Array of candidate objects
 * @param {string} searchTerm - Search term to filter by
 * @returns {Array} Filtered candidates
 */
export const filterBySearchTerm = (candidates, searchTerm) => {
  if (!searchTerm) return candidates;
  
  const term = searchTerm.toLowerCase();
  return candidates.filter(candidate =>
    candidate.name.toLowerCase().includes(term) ||
    candidate.title.toLowerCase().includes(term) ||
    candidate.skills.some(skill => skill.toLowerCase().includes(term)) ||
    candidate.location.toLowerCase().includes(term)
  );
};

/**
 * Filters candidates by location
 * @param {Array} candidates - Array of candidate objects
 * @param {string} location - Location to filter by
 * @returns {Array} Filtered candidates
 */
export const filterByLocation = (candidates, location) => {
  if (!location) return candidates;
  return candidates.filter(candidate => 
    candidate.location.toLowerCase().includes(location.toLowerCase())
  );
};

/**
 * Filters candidates by experience level
 * @param {Array} candidates - Array of candidate objects
 * @param {string} level - Experience level (junior/mid/senior)
 * @returns {Array} Filtered candidates
 */
export const filterByExperience = (candidates, level) => {
  if (!level) return candidates;
  
  switch (level) {
    case 'junior':
      return candidates.filter(candidate => candidate.experience <= 3);
    case 'mid':
      return candidates.filter(candidate => candidate.experience > 3 && candidate.experience <= 6);
    case 'senior':
      return candidates.filter(candidate => candidate.experience > 6);
    default:
      return candidates;
  }
};

/**
 * Sorts candidates by specified criteria
 * @param {Array} candidates - Array of candidate objects
 * @param {string} sortBy - Sort criteria (name/experience/salary)
 * @returns {Array} Sorted candidates
 */
export const sortCandidates = (candidates, sortBy) => {
  const sortedCandidates = [...candidates];
  
  switch (sortBy) {
    case 'name':
      return sortedCandidates.sort((a, b) => a.name.localeCompare(b.name));
    case 'experience':
      return sortedCandidates.sort((a, b) => b.experience - a.experience);
    case 'salary':
      return sortedCandidates.sort((a, b) => b.salary - a.salary);
    default:
      return sortedCandidates;
  }
};

/**
 * Gets unique locations from candidates array
 * @param {Array} candidates - Array of candidate objects
 * @returns {Array} Sorted array of unique locations
 */
export const getUniqueLocations = (candidates) => {
  return [...new Set(candidates.map(c => c.location))].sort();
};
