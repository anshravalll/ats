/**
 * Filters candidates based on include and exclude criteria
 * @param {Object} plan - Filter plan with optional include and exclude
 * @param {Array} candidates - Array of all candidates
 * @returns {Array} Filtered candidates
 */
export function filterCandidates(plan, candidates) {

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

  if (!plan || typeof plan !== 'object') {
    console.warn('Invalid rank plan, returning candidates filtered by ids only');
    return candidates.filter(c => ids.includes(c.id));
  }

  const subset = candidates.filter(c => ids.includes(c.id));
  const sortFields = [plan.primary, ...(plan.tie_breakers || [])];

  // Debug: Show candidates before ranking
  subset.slice(0, 3).forEach((candidate, index) => {
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
  ranked.slice(0, 3).forEach((candidate, index) => {
  });

  // Debug: Show order change
  const beforeIds = subset.map(c => c.id);
  const afterIds = ranked.map(c => c.id);
  console.log('Before:', beforeIds.slice(0, 5));
  console.log('Order changed?', JSON.stringify(beforeIds) !== JSON.stringify(afterIds));

  return ranked;
}

/**
 * Aggregates statistics for given candidate IDs
 * @param {Array} ids - Array of candidate IDs
 * @param {Array} candidates - Array of all candidates
 * @returns {Object} Aggregated stats: count, avg_experience, top_skills
 */
export function aggregateStats(ids, candidates) {

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
  return stats;
}

/**
 * Makes an API call to get AI plan for filtering and ranking candidates
 * @param {string} userQuery - The user's search query
 * @param {Array} candidates - Array of all candidates (optional, will be sent if provided)
 * @param {boolean} useMockAPI - Whether to use mock API endpoint
 * @returns {Promise<Object>} AI response with filter and rank plans
 */
export async function getAIPlan(userQuery, candidates = null, useMockAPI = false) {
  
  const apiEndpoint = useMockAPI ? '/api/chat/candidates-mock' : '/api/chat/think';
  
  try {
    const requestBody = {
      messages: [
        {
          role: 'user',
          content: userQuery,
          ...(candidates && {
            data: {
              candidates: JSON.stringify(candidates),
              fields: Object.keys(candidates[0] || {}).join(', ')
            }
          })
        }
      ]
    };

    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Extract the AI response from the streaming response
    const aiMessage = data.messages?.find(msg => msg.role === 'assistant');
    if (!aiMessage?.content) {
      throw new Error('No AI response found in API response');
    }

    // Parse the JSON from the AI response (similar to UI logic)
    const firstBrace = aiMessage.content.indexOf('{');
    const lastBrace = aiMessage.content.lastIndexOf('}');
    
    if (firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace) {
      throw new Error('No valid JSON found in AI response');
    }
    
    const jsonString = aiMessage.content.substring(firstBrace, lastBrace + 1);
    const aiResponse = JSON.parse(jsonString);
    
    const filterPlan = aiResponse.filter || { include: [], exclude: [] };
    const rankPlan = aiResponse.rank || { primary: 'years_experience', tie_breakers: [] };
    
    
    return {
      filterPlan,
      rankPlan,
      rawResponse: aiMessage.content
    };
    
  } catch (error) {
    console.error('❌ Error getting AI plan:', error);
    throw error;
  }
}

/**
 * Executes a complete AI search workflow: get plan, filter, rank, and optionally summarize
 * @param {string} userQuery - The user's search query
 * @param {Array} candidates - Array of all candidates
 * @param {boolean} useMockAPI - Whether to use mock API endpoint
 * @param {boolean} generateSummary - Whether to generate a summary (default: false)
 * @returns {Promise<Object>} Complete search results
 */
export async function executeAISearch(userQuery, candidates, useMockAPI = false, generateSummary = false) {
  
  try {
    // Step 1: Get AI plan
    const { filterPlan, rankPlan } = await getAIPlan(userQuery, candidates, useMockAPI);
    
    // Step 2: Filter candidates
    const filteredCandidates = filterCandidates(filterPlan, candidates);
    const filteredIds = filteredCandidates.map(c => c.id);
    
    // Step 3: Rank candidates
    const rankedCandidates = rankCandidates(filteredIds, rankPlan, candidates);
    const rankedIds = rankedCandidates.map(c => c.id);
    
    // Step 4: Generate summary (optional)
    let summary = null;
    if (generateSummary) {
      try {
        const topCandidates = rankedCandidates.slice(0, 5);
        const speakResponse = await fetch('/api/chat/speak', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userQuery: userQuery,
            topCandidates: topCandidates,
            filteredCount: rankedCandidates.length,
            totalCount: candidates.length
          }),
        });
        
        if (speakResponse.ok) {
          const speakResult = await speakResponse.json();
          if (speakResult.success) {
            summary = speakResult.text;
          }
        }
      } catch (summaryError) {
        console.warn('⚠️ Summary generation failed:', summaryError);
      }
    }
    
    const results = {
      userQuery,
      filterPlan,
      rankPlan,
      filteredCandidates,
      rankedCandidates,
      rankedIds,
      summary,
      stats: aggregateStats(rankedIds, candidates)
    };
    
    return results;
    
  } catch (error) {
    console.error('❌ AI search workflow failed:', error);
    throw error;
  }
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
