/**
 * Filters candidates based on include and exclude criteria
 * @param {Object} plan - Filter plan with optional include and exclude
 * @param {Array} candidates - Array of all candidates
 * @returns {Array} Filtered candidates
 */
export function filterCandidates(plan, candidates) {
  console.log('🔍 ACT 1: Filtering candidates with plan:', plan);

  if (!plan || typeof plan !== 'object') {
    console.warn('Invalid filter plan, returning all candidates');
    return [...candidates];
  }

  let filtered = [...candidates];

  // Apply include filters
  if (plan.include && Array.isArray(plan.include) && plan.include.length > 0) {
    plan.include.forEach(filter => {
      filtered = filtered.filter(candidate => {
        const value = candidate[filter.field];
        return matchesFilter(value, filter);
      });
    });
  }

  // Apply exclude filters
  if (plan.exclude && Array.isArray(plan.exclude) && plan.exclude.length > 0) {
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

  if (!plan || typeof plan !== 'object') {
    console.warn('Invalid rank plan, returning candidates filtered by ids only');
    return candidates.filter(c => ids.includes(c.id));
  }

  const subset = candidates.filter(c => ids.includes(c.id));
  const sortFields = [plan.primary, ...(plan.tie_breakers || [])];

  // Debug: Show candidates before ranking
  console.log('🔢 CANDIDATES BEFORE RANKING:');
  subset.slice(0, 3).forEach((candidate, index) => {
    console.log(`${index + 1}. ${candidate.name || candidate.id} - ${plan.primary}: ${candidate[plan.primary]}`);
  });

  const ranked = subset.sort((a, b) => {
    for (const field of sortFields) {
      const aVal = getFieldValue(a, field);
      const bVal = getFieldValue(b, field);
      if (aVal > bVal) return -1;
      if (aVal < bVal) return 1;
    }
    return 0;
  });

  // Debug: Show candidates after ranking
  console.log('🔢 CANDIDATES AFTER RANKING:');
  ranked.slice(0, 3).forEach((candidate, index) => {
    console.log(`${index + 1}. ${candidate.name || candidate.id} - ${plan.primary}: ${candidate[plan.primary]}`);
  });

  // Debug: Show order change
  const beforeIds = subset.map(c => c.id);
  const afterIds = ranked.map(c => c.id);
  console.log('🔄 ORDER COMPARISON:');
  console.log('Before:', beforeIds.slice(0, 5));
  console.log('After:', afterIds.slice(0, 5));
  console.log('Order changed?', JSON.stringify(beforeIds) !== JSON.stringify(afterIds));

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
  // Handle both 'operator' (from AI) and 'type' (internal) field names
  const type = filter.type || filter.operator || 'exact';
  const filterValue = filter.value;

  switch (type) {
    case 'contains':
      return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
    case 'regex':
      try {
        const regex = new RegExp(filterValue, 'i');
        return regex.test(String(value));
      } catch {
        return false;
      }
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
  if (field === 'experience' || field === 'years_experience' || field === 'age' ||
      field === 'desired_salary_usd' || field === 'remote_experience_years') {
    const numValue = parseFloat(value) || 0;
    return numValue;
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
