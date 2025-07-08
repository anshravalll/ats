/**
 * CSV loading and parsing utilities
 */

/**
 * Loads and parses CSV file from public directory
 * @param {string} filePath - Path to CSV file in public folder
 * @returns {Promise<Array>} Parsed CSV data
 */
export const loadCSVFile = async (filePath) => {
  try {
    const Papa = (await import('papaparse')).default;
    const response = await fetch(filePath);
    const csvText = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        delimiter: ",",
        complete: (results) => resolve(results.data),
        error: (error) => reject(error)
      });
    });
  } catch (error) {
    throw new Error(`Failed to load CSV: ${error.message}`);
  }
};

/**
 * Transforms raw CSV data to application format
 * @param {Array} rawData - Raw CSV data
 * @returns {Array} Transformed candidate objects
 */
export const transformCandidateData = (rawData) => {
  return rawData.map((row, index) => {
    // Start with all original CSV fields
    const candidate = { ...row };
    
    // Apply necessary type conversions and enhancements
    return {
      ...candidate,  // ← Keep ALL original CSV fields
      
      // Add computed/enhanced fields
      id: parseInt(row.id) || index + 1,
      name: row.full_name || row.name || '',
      experience: parseInt(row.years_experience) || 0,
      years_experience: parseInt(row.years_experience) || 0, // Keep both mappings
      skills: row.skills ? row.skills.split(';').map(skill => skill.trim()) : [],
      salary: parseInt(row.desired_salary_usd) || 60000,
      desired_salary_usd: parseInt(row.desired_salary_usd) || 60000, // Keep both
      remote_experience_years: parseInt(row.remote_experience_years) || 0,
      availability_weeks: parseInt(row.availability_weeks) || 0,
      notice_period_weeks: parseInt(row.notice_period_weeks) || 0,
      
      // Handle boolean fields
      willing_to_relocate: row.willing_to_relocate === 'true' || row.willing_to_relocate === '1',
      open_to_contract: row.open_to_contract === 'true' || row.open_to_contract === '1',
      
      // Generate additional UI fields
      avatar: generateAvatarUrl(index),
      email: row.email || generateEmail(row.full_name),
      phone: row.phone || '+1-555-0000',
      availability: parseAvailability(row.availability_weeks)
    };
  });
};

/**
 * Private helper functions
 */
const generateAvatarUrl = (index) => 
  `https://images.unsplash.com/photo-${1494790108755 + (index * 1000)}?w=150&h=150&fit=crop&crop=face`;

const generateEmail = (fullName) => 
  fullName ? `${fullName.toLowerCase().replace(/\s+/g, '.')}@email.com` : 'unknown@email.com';

const parseAvailability = (weeks) => {
  if (weeks === "0") return "Available";
  if (weeks) return `${weeks} weeks notice`;
  return "Available";
};
