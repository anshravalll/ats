import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

export const maxDuration = 30;

// Schema Definitions for Structured Output
const FilterCriteriaSchema = z.object({
  field: z.string().describe("The candidate field to filter on (e.g., skills, years_experience, location)"),
  operator: z.enum(['exact', 'contains', 'regex', 'gte', 'lte', 'boolean']).describe("Filter operator type"),
  value: z.union([z.string(), z.number(), z.boolean()]).describe("Value to filter by")
});

const FilterPlanSchema = z.object({
  include: z.array(FilterCriteriaSchema).optional().describe("Criteria that candidates must match (AND logic)"),
  exclude: z.array(FilterCriteriaSchema).optional().describe("Criteria that candidates must not match (NOT logic)")
});

const RankingPlanSchema = z.object({
  primary: z.string().describe("Primary field to rank candidates by (higher values ranked first)"),
  tie_breakers: z.array(z.string()).optional().describe("Secondary fields for tie-breaking in order of priority")
});

const ThinkResponseSchema = z.object({
  filter: FilterPlanSchema.describe("Filtering plan to narrow down candidates based on criteria"),
  rank: RankingPlanSchema.describe("Ranking plan to sort filtered candidates by importance")
});

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
    
    // Create comprehensive prompt for THINK phase
    const thinkPrompt = `
You are an expert ATS (Applicant Tracking System) AI assistant. Your task is to analyze the user's candidate search request and generate a structured filter and ranking plan that will be used by JavaScript functions to process candidate data.

**USER REQUEST:** "${userMessage}"

**AVAILABLE CANDIDATE FIELDS:** ${availableFields}

**YOUR TASK:** Generate a JSON object with filter and rank plans that will be processed by these JavaScript functions:

1. **filterCandidates(plan, candidates)** - Filters candidates using include/exclude criteria
2. **rankCandidates(candidates, plan)** - Ranks candidates by primary field + tie-breakers

**FIELD REFERENCE & OPERATORS:**
- **years_experience** (numeric): Use gte/lte for experience ranges
- **skills** (semicolon-separated): Use "contains" for skill matching  
- **location** (string): Use "contains" for city/country matching
- **title** (string): Use "contains" for job title matching
- **willing_to_relocate** (boolean): Use "boolean" for true/false
- **work_preference** (Remote/Onsite/Hybrid): Use "exact" for preference
- **desired_salary_usd** (numeric): Use gte/lte for salary ranges
- **visa_status** (string): Use "exact" for visa requirements
- **education_level** (Bachelor's/Master's/PhD/Bootcamp): Use "exact"
- **remote_experience_years** (numeric): Use gte/lte for remote work experience

**OPERATOR TYPES:**
- **exact**: Exact match (case-insensitive)
- **contains**: Substring match (case-insensitive) 
- **regex**: Regular expression match
- **gte**: Greater than or equal (numeric)
- **lte**: Less than or equal (numeric)
- **boolean**: Boolean true/false match

**RANKING STRATEGY:**
- **Primary field**: Most important factor (higher values ranked first)
- **Tie-breakers**: Secondary factors in order of importance

**EXAMPLES:**

Query: "React developers with 5+ years in Germany"
Response:
{
  "filter": {
    "include": [
      {"field": "skills", "operator": "contains", "value": "React"},
      {"field": "years_experience", "operator": "gte", "value": 5},
      {"field": "location", "operator": "contains", "value": "Germany"}
    ]
  },
  "rank": {
    "primary": "years_experience",
    "tie_breakers": ["remote_experience_years", "desired_salary_usd"]
  }
}

Query: "Senior remote Python developers under 150k"
Response:
{
  "filter": {
    "include": [
      {"field": "skills", "operator": "contains", "value": "Python"},
      {"field": "work_preference", "operator": "exact", "value": "Remote"},
      {"field": "desired_salary_usd", "operator": "lte", "value": 150000}
    ]
  },
  "rank": {
    "primary": "years_experience",
    "tie_breakers": ["remote_experience_years"]
  }
}

**IMPORTANT RULES:**
1. Always use appropriate operators for each field type
2. Include filters narrow down results (AND logic)
3. Exclude filters remove unwanted results (NOT logic)
4. Primary ranking field should match the user's main priority
5. Tie-breakers should be relevant secondary factors
6. Return ONLY the JSON object, no additional text

Generate the filter and rank plan for the user's request:`;

    // Generate structured response using AI SDK
    const result = await generateObject({
      model: openai('gpt-4.1-nano'),
      schema: ThinkResponseSchema,
      prompt: thinkPrompt,
      temperature: 0.1 // Low temperature for consistent structured output
    });

    console.log('✅ THINK phase completed:', JSON.stringify(result.object, null, 2));
    
    // Return the structured plan along with metadata
    return Response.json({
      success: true,
      phase: 'THINK',
      data: result.object,
      metadata: {
        userQuery: userMessage,
        availableFields: availableFields,
        candidateCount: candidates.length,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ THINK phase error:', error);
    return Response.json({ 
      success: false,
      error: error.message,
      phase: 'THINK'
    }, { status: 500 });
  }
}
