import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

export const maxDuration = 30;

export async function POST(req) {
  
  try {
    const { userQuery, topCandidates, filteredCount, totalCount } = await req.json();
    
    // Validate input data
    if (!topCandidates || !Array.isArray(topCandidates)) {
      throw new Error('No top candidates data provided');
    }
    
    if (!userQuery) {
      throw new Error('No user query provided');
    }
    
    console.log('🔍 Original query:', userQuery);
    
    // Create comprehensive recruitment summary prompt with ALL available fields
    const summaryPrompt = `You are a professional recruiter creating a summary for hiring managers. 

**SEARCH REQUEST:** "${userQuery}"

**SEARCH RESULTS:**
- Total candidates found: ${filteredCount} out of ${totalCount} candidates
- Top ${topCandidates.length} candidates selected and ranked for review

**TOP CANDIDATES (IN RANKED ORDER):**
${topCandidates.map((candidate, index) => `
${index + 1}. **${candidate.full_name}** - ${candidate.title}
   - Location: ${candidate.location} (${candidate.timezone})
   - Experience: ${candidate.years_experience} years (Remote: ${candidate.remote_experience_years} years)
   - Skills: ${candidate.skills}
   - Languages: ${candidate.languages || 'Not specified'}
   - Education: ${candidate.education_level} in ${candidate.degree_major}
   - Salary: $${candidate.desired_salary_usd?.toLocaleString() || 'Not specified'}
   - Work Preference: ${candidate.work_preference}
   - Available: ${candidate.availability_weeks} weeks notice
   - Notice Period: ${candidate.notice_period_weeks} weeks
   - Willing to Relocate: ${candidate.willing_to_relocate ? 'Yes' : 'No'}
   - Open to Contract: ${candidate.open_to_contract ? 'Yes' : 'No'}
   - Visa Status: ${candidate.visa_status}
   - Citizenships: ${candidate.citizenships}
   - Summary: ${candidate.summary || 'No summary available'}
   - Tags: ${candidate.tags || 'None'}
   - Last Active: ${candidate.last_active}
`).join('')}

**YOUR TASK:**
Create a professional, concise recruitment summary (4-5 sentences) that highlights:

1. **Match Quality**: How well these candidates align with the search criteria
2. **Key Strengths**: Most relevant skills and experience patterns across the ranked results
3. **Standout Qualifications**: Notable achievements or unique qualifications from top candidates
4. **Ranking Insights**: Why the top-ranked candidates stand out
5. **Actionable Insights**: Practical next steps for hiring managers

**IMPORTANT:** 
- Respect the ranking order - mention why top candidates are ranked higher
- Reference specific skills, experience levels, and qualifications from the data
- Be specific about salary ranges, availability, and work preferences
- Highlight any unique combinations of skills or experience
- Keep it under 100 words and use paragraphs

**TONE:** Professional, confident, and actionable
**FORMAT:** Natural paragraph format, no bullet points
**FOCUS:** Quality matches, ranking justification, and practical hiring insights`;

    // Generate completion response using AI SDK
    const result = await generateText({
      model: openai('gpt-4.1-mini'),
      messages: [
        {
          role: 'system',
          content: 'You are an expert recruitment consultant specializing in technical talent acquisition. Create compelling, professional candidate summaries that help hiring managers make informed decisions quickly. Always respect the ranking order of candidates and explain why top candidates are superior.'
        },
        {
          role: 'user',
          content: summaryPrompt
        }
      ],
      temperature: 0.3, // Consistent but slightly creative
      maxTokens: 600,   // Increased for more comprehensive summaries
    });

    
    return new Response(JSON.stringify({
      success: true,
      phase: 'SPEAK',
      text: result.text
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('❌ SPEAK phase error:', error);
    
    return Response.json({ 
      success: false,
      error: error.message,
      phase: 'SPEAK'
    }, { status: 500 });
  }
}
