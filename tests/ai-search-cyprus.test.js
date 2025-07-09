import { getAIPlan, filterCandidates, rankCandidates } from '../src/lib/mcp-tools';

describe('AI Search: React dev, Cyprus, sort by experience desc', () => {
  const candidates = [
    {
      id: 5,
      name: 'Lisa Chen',
      title: 'React Developer',
      location: 'Cyprus',
      skills: ['React', 'JavaScript', 'CSS'],
      experience: 3,
      years_experience: 3,
    },
    {
      id: 12,
      name: 'Nikos Papadopoulos',
      title: 'Senior React Developer',
      location: 'Cyprus',
      skills: ['React', 'TypeScript', 'Node.js'],
      experience: 7,
      years_experience: 7,
    },
    // Add a distractor candidate
    {
      id: 8,
      name: 'Anna Kowalski',
      title: 'Backend Developer',
      location: 'Germany',
      skills: ['Python', 'Django', 'PostgreSQL'],
      experience: 5,
      years_experience: 5,
    },
  ];

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it('should rank candidate #12 above #5 using AI plan from API', async () => {
    // Mock the API response for getAIPlan
    const aiResponse = {
      messages: [
        {
          role: 'assistant',
          content: `Here is the plan: {\"filter\": {\"include\": [ {\"field\": \"skills\", \"value\": \"React\", \"type\": \"contains\" }, {\"field\": \"location\", \"value\": \"Cyprus\", \"type\": \"contains\" } ], \"exclude\": [] }, \"rank\": {\"primary\": \"experience\", \"tie_breakers\": [] }}`
        }
      ]
    };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => aiResponse
    });

    const { filterPlan, rankPlan } = await getAIPlan('React dev, Cyprus, sort by experience desc', candidates);
    const filtered = filterCandidates(filterPlan, candidates);
    const filteredIds = filtered.map(c => c.id);
    const ranked = rankCandidates(filteredIds, rankPlan, candidates);
    const rankedIds = ranked.map(c => c.id);

    // Candidate #12 should be before #5
    expect(rankedIds.indexOf(12)).toBeLessThan(rankedIds.indexOf(5));
  });
});
