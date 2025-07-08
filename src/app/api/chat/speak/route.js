import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const maxDuration = 30;

export async function POST(req) {
  console.log('💬 SPEAK Phase API called');
  
  try {
    const { userQuery, topCandidates, filteredCount, totalCount } = await req.json();
    
    // Validate input data
    if (!topCandidates || !Array.isArray(topCandidates)) {
      throw new Error('No top candidates data provided');
    }
    
    if (!userQuery) {
      throw new Error('No user query provided');
    }
    
    console.log('📊 Processing summary for', topCandidates.length, 'top candidates');
    console.log('🔍 Original query:', userQuery);
    console.log('📈 Filtered count:', filteredCount, 'from', totalCount, 'total');
    
    // Create comprehensive recruitment summary prompt
    const summaryPrompt = `You are a professional recruiter creating a summary for hiring managers. 

**SEARCH REQUEST:** "${userQuery}"

**SEARCH RESULTS:**
- Total candidates found: ${filteredCount} out of ${totalCount} candidates
- Top 5 candidates selected for review

**TOP CANDIDATES:**
${topCandidates.map((candidate, index) => `
${index + 1}. **${candidate.full_name}** - ${candidate.title}
   - Location: ${candidate.location}
   - Experience: ${candidate.years_experience} years
   - Skills: ${candidate.skills}
   - Education: ${candidate.education_level} in ${candidate.degree_major}
   - Salary: $${candidate.desired_salary_usd?.toLocaleString() || 'Not specified'}
   - Work Preference: ${candidate.work_preference}
   - Available: ${candidate.availability_weeks} weeks
   - Visa Status: ${candidate.visa_status}
`).join('')}

**YOUR TASK:**
Create a professional, concise recruitment summary (3-4 sentences) that highlights:

1. **Match Quality**: How well these candidates align with the search criteria
2. **Key Strengths**: Most relevant skills and experience patterns
3. **Standout Qualifications**: Notable achievements or unique qualifications
4. **Actionable Insights**: Practical next steps for hiring managers

**TONE:** Professional, confident, and actionable
**FORMAT:** Natural paragraph format, no bullet points
**FOCUS:** Quality matches and practical hiring insights

End your response with this exact format for candidate IDs:
[CANDIDATE_IDS: ${topCandidates.map(c => c.id).join(', ')}]`;

    // Generate streaming summary using AI SDK
    const result = streamText({
      model: openai('gpt-4.1-nano'),
      messages: [
        {
          role: 'system',
          content: 'You are an expert recruitment consultant specializing in technical talent acquisition. Create compelling, professional candidate summaries that help hiring managers make informed decisions quickly.'
        },
        {
          role: 'user',
          content: summaryPrompt
        }
      ],
      temperature: 0.3, // Consistent but slightly creative
      maxTokens: 500,
    });

    console.log('✅ SPEAK phase streaming response initiated');
    
    return result.toDataStreamResponse();
    
  } catch (error) {
    console.error('❌ SPEAK phase error:', error);
    
    return Response.json({ 
      success: false,
      error: error.message,
      phase: 'SPEAK'
    }, { status: 500 });
  }
}
