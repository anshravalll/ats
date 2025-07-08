import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const maxDuration = 30;

export async function POST(req) {
  console.log('🧠 THINK Phase API called');
  
  try {
    const { messages } = await req.json();
    
    // Extract candidates from message data (sent on first message)
    let candidates = [];
    let availableFields = '';
    
    // Find the message with candidates data
    const messageWithCandidates = messages.find(msg => msg.data?.candidates);
    console.log("Check this ", messageWithCandidates);
    
    if (messageWithCandidates?.data) {
      candidates = JSON.parse(messageWithCandidates.data.candidates);
      availableFields = messageWithCandidates.data.fields;
      console.log('📊 Intercepted candidates:', candidates.length);
      console.log('📋 Available fields:', availableFields);
    } else {
      throw new Error('No candidates data found in messages');
    }
    
    // Get the user's search query
    const userMessage = messages[messages.length - 1]?.content || '';
    console.log('🔍 User query:', userMessage);
    
    // RIGID prompt with ONLY available fields from csvLoader.js
    const thinkPrompt = `
You are an ATS AI assistant. Generate a JSON filter and ranking plan using ONLY the available fields listed below.

**USER QUERY:** "${userMessage}"

**CRITICAL RULES:**
1. You MUST respond with ONLY a valid JSON object - NO other text
2. You MUST use ONLY the fields listed in AVAILABLE FIELDS section
3. You MUST use ONLY the operators listed for each field type
4. Do NOT use any field not explicitly listed below
5. Do NOT add explanatory text before or after JSON
6. Do NOT use markdown formatting or code blocks

**AVAILABLE FIELDS (FROM CSV LOADER - ONLY USE THESE):**

**Original CSV Fields:**
- **id** (numeric): Use gte/lte for ID ranges
- **full_name** (string): Use "contains" for name matching
- **title** (string): Use "contains" for job title matching  
- **location** (string): Use "contains" for city/state/country matching
- **timezone** (string): Use "exact" for timezone matching
- **years_experience** (numeric): Use gte/lte for experience ranges
- **skills** (string): Use "contains" for skill matching (semicolon-separated)
- **languages** (string): Use "contains" for language matching
- **education_level** (string): Use "exact" for education level
- **degree_major** (string): Use "contains" for degree field matching
- **availability_weeks** (numeric): Use gte/lte for availability timeframe
- **willing_to_relocate** (boolean): Use "boolean" for true/false
- **work_preference** (string): Use "exact" for Remote/Onsite/Hybrid
- **notice_period_weeks** (numeric): Use gte/lte for notice period
- **desired_salary_usd** (numeric): Use gte/lte for salary ranges
- **open_to_contract** (boolean): Use "boolean" for contract availability
- **remote_experience_years** (numeric): Use gte/lte for remote work experience
- **visa_status** (string): Use "exact" for visa requirements
- **citizenships** (string): Use "contains" for citizenship matching
- **summary** (string): Use "contains" for summary text matching
- **tags** (string): Use "contains" for tag matching
- **last_active** (string): Use "contains" for activity status

**Enhanced Fields (Also Available):**
- **name** (string): Use "contains" for name matching
- **experience** (numeric): Use gte/lte for experience ranges
- **salary** (numeric): Use gte/lte for salary ranges
- **availability** (string): Use "contains" for availability status

**ALLOWED OPERATORS ONLY:**
- "contains" - for string/text matching
- "gte" - for greater than or equal (numbers only)
- "lte" - for less than or equal (numbers only)
- "exact" - for exact string matching
- "boolean" - for true/false values only

**REQUIRED JSON STRUCTURE:**
{
  "filter": {
    "include": [{"field": "FIELD_NAME", "type": "OPERATOR", "value": "VALUE"}],
    "exclude": [{"field": "FIELD_NAME", "type": "OPERATOR", "value": "VALUE"}]
  },
  "rank": {
    "primary": "FIELD_NAME",
    "tie_breakers": ["FIELD_NAME"]
  }
}

**STRICT EXAMPLES:**

Query: "React developers with 5+ years"
Response:
{"filter":{"include":[{"field":"skills","type":"contains","value":"React"},{"field":"years_experience","type":"gte","value":5}],"exclude":[]},"rank":{"primary":"years_experience","tie_breakers":["desired_salary_usd"]}}

Query: "Remote Python developers willing to relocate under 120k"
Response:
{"filter":{"include":[{"field":"skills","type":"contains","value":"Python"},{"field":"work_preference","type":"exact","value":"Remote"},{"field":"willing_to_relocate","type":"boolean","value":true},{"field":"desired_salary_usd","type":"lte","value":120000}],"exclude":[]},"rank":{"primary":"years_experience","tie_breakers":["remote_experience_years"]}}

Query: "Senior engineers in New York available immediately"
Response:
{"filter":{"include":[{"field":"title","type":"contains","value":"Senior"},{"field":"location","type":"contains","value":"New York"},{"field":"availability_weeks","type":"lte","value":0}],"exclude":[]},"rank":{"primary":"years_experience","tie_breakers":["desired_salary_usd"]}}

**VALIDATION CHECKLIST:**
- ✓ Only use fields from the AVAILABLE FIELDS list above
- ✓ Only use operators: contains, gte, lte, exact, boolean
- ✓ Primary ranking field must be numeric: years_experience, experience, desired_salary_usd, salary, remote_experience_years
- ✓ Tie breakers must be from available fields
- ✓ Response must be valid JSON with no extra text
- ✓ Boolean fields only accept true/false values
- ✓ Numeric fields only use gte/lte operators
- ✓ String fields use contains/exact operators

Generate the filter and rank plan for: "${userMessage}"`;

    // Use streamText properly
    const result = await streamText({
      model: openai('gpt-4.1-mini'),
      prompt: thinkPrompt,
      temperature: 0.0, // Set to 0 for maximum consistency
      maxTokens: 400     // Increased slightly to handle larger field list
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
