import { NextResponse } from 'next/server';

// Mock candidate database (simulate your real data structure)
const MOCK_CANDIDATES = [
  { id: 1, name: "Sarah Williams", title: "Senior React Developer", location: "Germany", skills: ["React", "TypeScript", "Node.js"] },
  { id: 2, name: "Carlos Mendoza", title: "Python Developer", location: "Cyprus", skills: ["Python", "Django", "AWS"] },
  { id: 3, name: "Emma Schmidt", title: "React Developer", location: "Germany", skills: ["React", "JavaScript", "CSS"] },
  { id: 4, name: "Ahmed Hassan", title: "Full Stack Developer", location: "Netherlands", skills: ["React", "Node.js", "PostgreSQL"] },
  { id: 5, name: "Lisa Chen", title: "Senior Full Stack Developer", location: "UK", skills: ["React", "Python", "AWS"] },
  { id: 7, name: "Marco Rossi", title: "Frontend Developer", location: "Germany", skills: ["React", "Vue.js", "TypeScript"] },
  { id: 8, name: "Anna Kowalski", title: "Senior Backend Developer", location: "Germany", skills: ["Python", "Django", "PostgreSQL"] },
  { id: 9, name: "David Kim", title: "DevOps Engineer", location: "Netherlands", skills: ["Python", "AWS", "Docker"] },
  { id: 11, name: "Sophie Laurent", title: "Senior Full Stack Developer", location: "UK", skills: ["React", "Node.js", "MongoDB"] },
  { id: 12, name: "James Wilson", title: "React Developer", location: "Germany", skills: ["React", "TypeScript", "GraphQL"] },
  { id: 13, name: "Maria Garcia", title: "Backend Developer", location: "Spain", skills: ["Python", "FastAPI", "PostgreSQL"] },
  { id: 15, name: "Alex Johnson", title: "Senior Software Engineer", location: "UK", skills: ["React", "Python", "AWS"] },
  { id: 18, name: "Oliver Brown", title: "Cloud Engineer", location: "Netherlands", skills: ["Python", "AWS", "Kubernetes"] },
  { id: 22, name: "Elena Petrov", title: "Senior React Developer", location: "Germany", skills: ["React", "TypeScript", "Node.js"] },
];

// Mock response patterns based on query analysis
const analyzeMockQuery = (query) => {
  const lowerQuery = query.toLowerCase();
  let candidateIds = [];
  let reasoning = "";

  // React developers
  if (lowerQuery.includes('react')) {
    candidateIds = MOCK_CANDIDATES
      .filter(c => c.skills.some(skill => skill.toLowerCase().includes('react')))
      .map(c => c.id);
    
    // Further filter by location
    if (lowerQuery.includes('germany')) {
      candidateIds = candidateIds.filter(id => 
        MOCK_CANDIDATES.find(c => c.id === id)?.location === 'Germany'
      );
      reasoning = `Found ${candidateIds.length} React developers in Germany with strong frontend experience.`;
    } else {
      reasoning = `Found ${candidateIds.length} React developers across all locations.`;
    }
  }
  
  // Senior candidates
  else if (lowerQuery.includes('senior')) {
    candidateIds = MOCK_CANDIDATES
      .filter(c => c.title.toLowerCase().includes('senior'))
      .map(c => c.id);
    reasoning = `Found ${candidateIds.length} senior candidates with extensive experience and leadership capabilities.`;
  }
  
  // Python + AWS
  else if (lowerQuery.includes('python') && lowerQuery.includes('aws')) {
    candidateIds = MOCK_CANDIDATES
      .filter(c => 
        c.skills.some(skill => skill.toLowerCase().includes('python')) &&
        c.skills.some(skill => skill.toLowerCase().includes('aws'))
      )
      .map(c => c.id);
    reasoning = `Found ${candidateIds.length} candidates with both Python programming and AWS cloud expertise.`;
  }
  
  // Full stack + database
  else if (lowerQuery.includes('full') && (lowerQuery.includes('database') || lowerQuery.includes('postgres'))) {
    candidateIds = MOCK_CANDIDATES
      .filter(c => 
        c.title.toLowerCase().includes('full') &&
        c.skills.some(skill => skill.toLowerCase().includes('postgres') || skill.toLowerCase().includes('mongo'))
      )
      .map(c => c.id);
    reasoning = `Found ${candidateIds.length} full-stack developers with database experience.`;
  }
  
  // Available immediately
  else if (lowerQuery.includes('available') || lowerQuery.includes('immediate')) {
    candidateIds = [1, 3, 5, 8, 12, 15]; // Mock available candidates
    reasoning = `Found ${candidateIds.length} candidates who are available to start immediately.`;
  }
  
  // Default case
  else {
    candidateIds = MOCK_CANDIDATES.slice(0, 5).map(c => c.id);
    reasoning = `Showing top ${candidateIds.length} candidates based on general search criteria.`;
  }

  return { candidateIds, reasoning };
};

// Create streaming response to simulate real AI
const createMockStream = (content) => {
  const encoder = new TextEncoder();
  
  return new ReadableStream({
    start(controller) {
      const words = content.split(' ');
      let index = 0;
      
      const sendChunk = () => {
        if (index < words.length) {
          const word = words[index] + (index < words.length - 1 ? ' ' : '');
          controller.enqueue(encoder.encode(word));
          index++;
          // Random delay between 30-120ms to simulate typing
          setTimeout(sendChunk, Math.random() * 90 + 30);
        } else {
          controller.close();
        }
      };
      
      // Start with small delay
      setTimeout(sendChunk, 100);
    }
  });
};

export async function POST(req) {
  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1];
    const userQuery = lastMessage.content;

    // Analyze query and get mock results
    const { candidateIds, reasoning } = analyzeMockQuery(userQuery);

    // Create realistic AI response
    const aiResponse = `I found ${candidateIds.length} candidates that match your criteria: "${userQuery}"

${reasoning}

Let me show you the best matches from our database. These candidates have been selected based on their skills, experience, and availability.

{"candidateIds": ${JSON.stringify(candidateIds)}, "reasoning": "${reasoning}"}`;

    // Return streaming response
    return new Response(createMockStream(aiResponse), {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error) {
    console.error('Mock API error:', error);
    return NextResponse.json({ error: 'Mock API error' }, { status: 500 });
  }
}
