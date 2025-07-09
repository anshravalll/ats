import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const maxDuration = 30;

export async function POST(req) {
  
  try {
    const { messages } = await req.json();
    
    // Extract candidates from message data (sent on first message)
    let candidates = [];
    let availableFields = '';
    
    // Find the message with candidates data
    const messageWithCandidates = messages.find(msg => msg.data?.candidates);
    
    if (messageWithCandidates?.data) {
      candidates = JSON.parse(messageWithCandidates.data.candidates);
      availableFields = messageWithCandidates.data.fields;
      console.log('📋 Available fields:', availableFields);
    } else {
      throw new Error('No candidates data found in messages');
    }
    
    // Get the user's search query
    const userMessage = messages[messages.length - 1]?.content || '';
    
    // Enhanced prompt for JSON text generation
    const thinkPrompt = `
You are an expert ATS (Applicant Tracking System) AI assistant. Your task is to analyze the user's candidate search request and generate a structured filter and ranking plan.

**USER REQUEST:** "${userMessage}"

**AVAILABLE CANDIDATE FIELDS:** ${availableFields}

**CRITICAL INSTRUCTIONS:**
- You MUST respond with ONLY a valid JSON object
- Do NOT include any explanatory text before or after the JSON
- Do NOT use markdown code blocks or formatting
- The JSON must be parseable by JSON.parse()
- Follow the exact schema structure shown below

**REQUIRED JSON SCHEMA:**
{
  "filter": {
    "include": [{"field": "string", "type": "exact|contains|regex|gte|lte|boolean", "value": "string|number|boolean"}],
    "exclude": [{"field": "string", "type": "exact|contains|regex|gte|lte|boolean", "value": "string|number|boolean"}]
  },
  "rank": {
    "primary": "string",
    "tie_breakers": ["string", "string"]
  }
}

**FIELD REFERENCE & types:**
- **id** (numeric): Use gte/lte for ID ranges
- **full_name** (string): Use "contains" for full name matching
- **name** (string): Use "contains" for name matching (enhanced field)
- **title** (string): Use "contains" for job title matching
- **location** (string): Use "contains" for city/country matching
- **timezone** (string): Use "exact" for timezone matching
- **years_experience** (numeric): Use gte/lte for experience ranges
- **experience** (numeric): Use gte/lte for experience ranges (enhanced field)
- **skills** (semicolon-separated): Use "contains" for skill matching
- **languages** (string): Use "contains" for language matching
- **education_level** (string): Use "exact" for education level (Bachelor's/Master's/PhD/Bootcamp)
- **degree_major** (string): Use "contains" for degree field matching
- **availability_weeks** (numeric): Use gte/lte for availability timeframe
- **availability** (string): Use "contains" for availability status (enhanced field)
- **willing_to_relocate** (boolean): Use "boolean" for true/false
- **work_preference** (string): Use "exact" for Remote/Onsite/Hybrid
- **notice_period_weeks** (numeric): Use gte/lte for notice period
- **desired_salary_usd** (numeric): Use gte/lte for salary ranges
- **salary** (numeric): Use gte/lte for salary ranges (enhanced field)
- **open_to_contract** (boolean): Use "boolean" for contract availability
- **remote_experience_years** (numeric): Use gte/lte for remote work experience
- **visa_status** (string): Use "exact" for visa requirements
- **citizenships** (string): Use "contains" for citizenship matching
- **summary** (string): Use "contains" for summary text matching
- **tags** (string): Use "contains" for tag matching
- **last_active** (string): Use "contains" for activity status
- **linkedin_url** (string): Use "contains" for LinkedIn profile matching

**EXAMPLES:**

Query: "React developers with 5+ years in Germany"
Response:
{"filter":{"include":[{"field":"skills","type":"contains","value":"React"},{"field":"years_experience","type":"gte","value":5},{"field":"location","type":"contains","value":"Germany"}]},"rank":{"primary":"years_experience","tie_breakers":["remote_experience_years","desired_salary_usd"]}}

Query: "Senior remote Python developers under 150k"
Response:
{"filter":{"include":[{"field":"skills","type":"contains","value":"Python"},{"field":"work_preference","type":"exact","value":"Remote"},{"field":"desired_salary_usd","type":"lte","value":150000}]},"rank":{"primary":"years_experience","tie_breakers":["remote_experience_years"]}}

**IMPORTANT:**
- Return ONLY the JSON object
- No explanations, no text, no formatting
- Must be valid JSON that passes JSON.parse()

Generate the filter and rank plan for: "${userMessage}"`;

    // Use streamText properly
    const result = await streamText({
      model: openai('gpt-4.1-mini'),
      prompt: thinkPrompt,
      temperature: 0.1,
      maxTokens: 500
    });

    // Return the streaming response
    return result.toDataStreamResponse();
    
  } catch (error) {
    console.error('❌ THINK phase error:', error);
    return Response.json({ 
      success: false,
      error: error.message,
      phase: 'THINK'
    }, { status: 500 });
  }
}
