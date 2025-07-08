/**
 * Filters candidates based on include and exclude criteria
 * @param {Object} plan - Filter plan with optional include and exclude
 * @param {Array} candidates - Array of all candidates
 * @returns {Array} Filtered candidates
 */
export function filterCandidates(plan, candidates) {
  console.log('🔍 ACT 1: Filtering candidates with plan:', plan);
  
  let filtered = [...candidates];

  // Apply include filters
  if (plan.include && plan.include.length > 0) {
    plan.include.forEach(filter => {
      filtered = filtered.filter(candidate => {
        const value = candidate[filter.field];
        return matchesFilter(value, filter);
      });
    });
  }

  // Apply exclude filters
  if (plan.exclude && plan.exclude.length > 0) {
    plan.exclude.forEach(filter => {
      filtered = filtered.filter(candidate => {
        const value = candidate[filter.field];
        return !matchesFilter(value, filter);
      });
    });
  }

  console.log(`✅ Filtered ${filtered.length} from ${candidates.length} candidates`);
  return filtered;
}

/**
 * Ranks candidates based on primary and tie-breaker fields
 * @param {Array} ids - Array of candidate IDs to rank
 * @param {Object} plan - Ranking plan with primary and optional tie_breakers
 * @param {Array} candidates - Array of all candidates
 * @returns {Array} Ranked candidates
 */
export function rankCandidates(ids, plan, candidates) {
  console.log('📊 ACT 2: Ranking candidates with plan:', plan);
  
  const subset = candidates.filter(c => ids.includes(c.id));
  
  const sortFields = [plan.primary, ...(plan.tie_breakers || [])];
  
  const ranked = subset.sort((a, b) => {
    for (const field of sortFields) {
      const aVal = getFieldValue(a, field);
      const bVal = getFieldValue(b, field);
      
      if (aVal > bVal) return -1;
      if (aVal < bVal) return 1;
    }
    return 0;
  });

  console.log(`✅ Ranked ${ranked.length} candidates`);
  return ranked;
}

/**
 * Aggregates statistics for given candidate IDs
 * @param {Array} ids - Array of candidate IDs
 * @param {Array} candidates - Array of all candidates
 * @returns {Object} Aggregated stats: count, avg_experience, top_skills
 */
export function aggregateStats(ids, candidates) {
  console.log('📈 Aggregating stats for candidates');
  
  const subset = candidates.filter(c => ids.includes(c.id));
  const count = subset.length;
  
  // Calculate average experience
  const totalExperience = subset.reduce((sum, c) => sum + (parseFloat(c.experience) || 0), 0);
  const avg_experience = count > 0 ? Math.round((totalExperience / count) * 10) / 10 : 0;

  // Aggregate skills frequency
  const skillCounts = {};
  subset.forEach(c => {
    const skills = Array.isArray(c.skills) ? c.skills : 
                   typeof c.skills === 'string' ? c.skills.split(',').map(s => s.trim()) : [];
    
    skills.forEach(skill => {
      if (skill) {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
      }
    });
  });

  // Get top 5 skills by frequency
  const top_skills = Object.entries(skillCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([skill, count]) => ({ skill, count }));

  const stats = { count, avg_experience, top_skills };
  console.log('✅ Stats calculated:', stats);
  
  return stats;
}

// Helper functions
function matchesFilter(value, filter) {
  const { type = 'exact', value: filterValue } = filter;
  
  switch (type) {
    case 'regex':
      const regex = new RegExp(filterValue, 'i');
      return regex.test(String(value));
    case 'boolean':
      return Boolean(value) === filterValue;
    case 'gte':
      return parseFloat(value) >= parseFloat(filterValue);
    case 'lte':
      return parseFloat(value) <= parseFloat(filterValue);
    case 'exact':
    default:
      return String(value).toLowerCase() === String(filterValue).toLowerCase();
  }
}

function getFieldValue(candidate, field) {
  const value = candidate[field];
  
  // Handle numeric fields
  if (field === 'experience' || field === 'age') {
    return parseFloat(value) || 0;
  }
  
  // Handle array fields (skills count)
  if (field === 'skills_count') {
    const skills = Array.isArray(candidate.skills) ? candidate.skills : 
                   typeof candidate.skills === 'string' ? candidate.skills.split(',') : [];
    return skills.length;
  }
  
  // Handle date fields
  if (field.includes('date')) {
    return new Date(value).getTime() || 0;
  }
  
  return value || '';
}
