import { NextResponse } from 'next/server';

const MOCK_CANDIDATES = [
  { id: 1, name: "Sarah Williams", title: "Senior React Developer", location: "Germany", skills: ["React", "TypeScript", "Node.js"] },
  { id: 2, name: "Carlos Mendoza", title: "Python Developer", location: "Cyprus", skills: ["Python", "Django", "AWS"] },
  { id: 3, name: "Emma Schmidt", title: "React Developer", location: "Germany", skills: ["React", "JavaScript", "CSS"] },
  { id: 4, name: "Ahmed Hassan", title: "Full Stack Developer", location: "Netherlands", skills: ["React", "Node.js", "PostgreSQL"] },
  { id: 5, name: "Lisa Chen", title: "Senior Full Stack Developer", location: "UK", skills: ["React", "Python", "AWS"] },
  { id: 7, name: "Marco Rossi", title: "Frontend Developer", location: "Germany", skills: ["React", "Vue.js", "TypeScript"] },
  { id: 8, name: "Anna Kowalski", title: "Senior Backend Developer", location: "Germany", skills: ["Python", "Django", "PostgreSQL"] },
  { id: 9, name: "David Kim", title: "DevOps Engineer", location: "Netherlands", skills: ["Python", "AWS", "Docker"] }
];

const SUGGESTED_RESPONSES = {
  "Find React developers in Germany with 5+ years experience": {
    candidateIds: [1, 7, 12],
    response: "I found 3 excellent React developers in Germany with 5+ years of experience! These candidates have proven expertise in React, TypeScript, and modern frontend technologies. They're all currently available and would be perfect for senior frontend roles."
  },
  "Show senior candidates available immediately": {
    candidateIds: [5, 8, 11],
    response: "Here are 3 senior candidates who are available to start immediately! They have extensive experience across different technologies and strong leadership capabilities. All of them have 7+ years of experience and are ready for immediate deployment."
  },
  "Which candidates know both Python and AWS?": {
    candidateIds: [2, 5, 9],
    response: "I found 3 candidates with strong expertise in both Python and AWS! These developers have hands-on experience with cloud infrastructure, backend development, and DevOps practices. They can handle both development and deployment aspects of your projects."
  }
};

export async function POST(req) {
  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1];
    const userQuery = lastMessage.content;

    // Check for EXACT match with suggested prompts
    const matchedResponse = SUGGESTED_RESPONSES[userQuery];
    
    if (!matchedResponse) {
      // Return complete response immediately without streaming
      return NextResponse.json({
        choices: [{
          message: {
            role: 'assistant',
            content: 'I can only respond to the suggested prompts in mock mode. Please try clicking one of the suggestion buttons.'
          }
        }]
      });
    }

    // Create complete response with candidate data
    const fullResponse = `${matchedResponse.response}

{"candidateIds": ${JSON.stringify(matchedResponse.candidateIds)}, "reasoning": "${matchedResponse.response}"}`;

    // Simulate processing delay then return complete response
    await new Promise(resolve => setTimeout(resolve, 1500));

    return NextResponse.json({
      choices: [{
        message: {
          role: 'assistant',
          content: fullResponse
        }
      }]
    });

  } catch (error) {
    console.error('Mock API error:', error);
    return NextResponse.json({ error: 'Mock API error' }, { status: 500 });
  }
}
