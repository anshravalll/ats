import {
  getAIPlan as fetchAIPlan,
  filterCandidates as applyFilter,
  rankCandidates as applyRanking,
} from "../src/lib/mcp-tools";

describe("AI Search suite: React devs in Cyprus sorted by experience (desc)", () => {
  const candidates = [
    {
      id: 5,
      name: "Lisa Chen",
      title: "React Developer",
      location: "Cyprus",
      skills: ["React", "JavaScript", "CSS"],
      experience: 3,
      years_experience: 3,
    },
    {
      id: 12,
      name: "Nikos Papadopoulos",
      title: "Senior React Developer",
      location: "Cyprus",
      skills: ["React", "TypeScript", "Node.js"],
      experience: 7,
      years_experience: 7,
    },
    // Add a distractor candidate (different role + location)
    {
      id: 8,
      name: "Anna Kowalski",
      title: "Backend Developer",
      location: "Germany",
      skills: ["Python", "Django", "PostgreSQL"],
      experience: 5,
      years_experience: 5,
    },
  ];

  beforeEach(() => {
    // Reset fetch mock before each test run
    global.fetch = jest.fn();
  });

  it("should rank candidate #12 above #5 using AI plan from API", async () => {
    // Mock the API response for fetchAIPlan
    const aiResponse = {
      messages: [
        {
          role: "assistant",
          content: `Here is the plan: {\"filter\": {\"include\": [ {\"field\": \"skills\", \"value\": \"React\", \"type\": \"contains\" }, {\"field\": \"location\", \"value\": \"Cyprus\", \"type\": \"contains\" } ], \"exclude\": [] }, \"rank\": {\"primary\": \"experience\", \"tie_breakers\": [] }}`,
        },
      ],
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => aiResponse,
    });

    const prompt = "React dev, Cyprus, sort by experience desc";
    const { filterPlan, rankPlan } = await fetchAIPlan(prompt, candidates);

    const filteredCandidates = applyFilter(filterPlan, candidates);
    const filteredIds = filteredCandidates.map(({ id }) => id);

    const ranked = applyRanking(filteredIds, rankPlan, candidates);
    const rankedIds = ranked.map(({ id }) => id);

    // Candidate #12 should be before #5
    expect(rankedIds.indexOf(12)).toBeLessThan(rankedIds.indexOf(5));
  });
});
