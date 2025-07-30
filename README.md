# ATS-Lite

**AI-Powered Candidate Discovery Platform**

**Loom Video:** [Watch Walkthrough](https://www.loom.com/share/fda0a5c1132b4032ae3a496146fb17ec)  
**Live Demo:** [ats-zeta-six.vercel.app](https://ats-zeta-six.vercel.app/)

---

## Assignment Objectives

This take-home assignment demonstrates:

- Clean code architecture with proper separation of concerns  
- Thoughtful UI/UX design decisions with clear reasoning  
- AI integration using modern tools and APIs  
- React/Next.js best practices and component patterns  
- State management with Context + useReducer  
- Real-time data processing and filtering capabilities  

---

## Design Philosophy & Technical Decisions

### The Recruiter-First Approach

Why is the AI search bar at the top?  
This is a recruiter-centric platform, not a chatbot. Recruiters need to find candidates quickly – the AI is a powerful tool, but the primary focus is discovery and filtering.  
The chat interface is available (expandable), but doesn't dominate the experience.

---

### UI/UX Architecture Decisions

#### Why only 2-color theming?

- Reduced cognitive load — clean, uncluttered interface helps focus  
- Better accessibility — high contrast without overwhelming colors  
- Professional appearance — appropriate for business/recruiting context  

#### Light/Dark Mode Implementation

Theme management is done using CSS custom properties with `localStorage` persistence.

#### Why 3 candidate cards per row?

- Tables show one candidate — linear info processing  
- 3 cards enable quick comparison: name, location, experience, salary, availability  
- 2 cards = excessive scrolling, 5+ = info overload  
- 3 cards = optimal balance  

---

### AI Model Selection: GPT-4.1-mini

Why GPT-4.1-mini instead of GPT-4/4o?

- Cost Efficiency – Less API cost when sending large datasets  
- Performance Optimization – Faster response times  
- Effective Prompt Engineering – Precision with smaller models  
- Right Tool for the Job – Bigger isn't always better  

Structured 3-phase AI pipeline allows GPT-4.1-mini to perform complex candidate filtering and ranking with minimal latency and cost.

---

## Installation & Setup

### Prerequisites

- Node.js 18+  
- OpenAI API key  

### Installation

```bash
npm install
cp .env.example .env.local
```

Fill in `.env.local`:

```env
OPENAI_API_KEY=your_openai_api_key_here
NEXT_PUBLIC_USE_MOCK_API=false
```

### Run the Application

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## AI Architecture Implementation

### 3-Phase AI Pipeline

```
User Query → THINK → ACT → SPEAK → UI Update
```

#### 1. THINK Phase – `/api/chat/think`

- GPT-4.1-mini analyzes the query  
- Outputs JSON-based filtering strategy  
- Generates multi-step ranking logic  

#### 2. ACT Phase – (Client-side)

- `filterCandidates()` applies AI strategy  
- `rankCandidates()` sorts based on logic  
- `applyAIFilters()` updates UI state  

#### 3. SPEAK Phase – `/api/chat/speak`

- Generates recruiter-facing summary  
- Explains candidate filtering logic  
- Outputs next actionable steps  

---

### Filtering & Ranking Logic

- Strings: `contains`, `exact`, `regex`  
- Numbers: `gte`, `lte`, `exact`  
- Booleans: true/false  
- Primary + Tie-Breakers: Stable multi-field sorting  

---

## Code Architecture & File Structure

```bash
src/
├── components/
│   ├── CandidateCard.jsx
│   ├── CandidateModal.jsx
│   ├── AISearch/
│   │   ├── StickyAIInterface.jsx
│   │   ├── AIFeedbackTimeline.jsx
│   │   └── ExpandedChatInterface.jsx
│   └── ui/
├── lib/
│   ├── context/CandidateContext.jsx
│   ├── mcp-tools.js
│   └── data/
```

---

## State Management

- `CandidateContext` + `useReducer`  
- Pure functions for state transformation  
- Async helpers for API requests  
- No global state pollution  

---

## Component Design Patterns

### StickyAIInterface

- Compact default mode for focused discovery  
- Expandable full chat experience  
- Animated via Framer Motion  

### AIFeedbackTimeline

- Shows AI THINK → ACT → SPEAK progress  
- Collapsible insight view  
- Prevents body scroll while modal is open  

---

## Data Handling & API Integration

### CSV Data

- 50 candidates from global regions  (pre-built)
- Normalized skill sets  
- CSV → JSON using PapaParse  

### API Integration

- RESTful endpoints per AI phase  
- Structured error responses  
- Toggleable mock API  
- Streaming responses for better UX  

---

## UI/UX Highlights

### Candidate Cards

- Primary: Name, title, location, experience  
- Secondary: Top 4 skills  
- Tertiary: Salary, availability  
- Hover effects and animated transitions  

### Candidate Modal

- Full data view  
- JSON export for collaboration  
- Responsive, accessible modal  

### Animation Strategy

- Framer Motion throughout  
- Loading indicators for feedback  
- Micro-interactions for UX polish  

---

## Tech Stack

| Area        | Stack/Tool               |
|-------------|--------------------------|
| Frontend    | Next.js 15, React 19     |
| Styling     | Tailwind CSS v4          |
| AI          | OpenAI GPT-4.1-mini      |
| State       | React Context + useReducer |
| CSV Parsing | Papa Parse               |
| Animation   | Framer Motion            |
| Testing     | Jest + React Testing Library |

---

## Testing & Mocks

### Mock API Mode

```js
localStorage.setItem('ats-use-mock-api', 'true')
```

### Run Tests

```bash
npm test
npm run test:coverage
```

#### Coverage Includes

- AI search flow  
- Candidate filtering  
- Ranking logic  
- Component rendering  

---

## Assignment Completion Notes

### Technical Challenges Solved

- Streaming API response handling  
- Async state transitions  
- Modal scroll containment  
- CSV data transformation and types  
- Dynamic prompt generation
- shadcn chatbot kit compitability issues with useChat (Vercel AI sdk)

### Code Quality

- Naming conventions  
- Error boundaries  
- useMemo/useCallback optimizations  
- Pure utility functions  
- JSDoc comments throughout  

### Design System

- Semantic tokens and color palette  
- Scaled typography and spacing  
- Mobile-first breakpoints  
- Accessible contrast levels  
- Reusable component architecture  

### Cost-Conscious AI

- GPT-4.1-mini for balance of quality vs. cost  
- Optimized prompt size and logic  
- Smart caching to avoid duplicate calls


Designed and built with purpose.  
Every click, scroll, and animation — intentional. Thanks.
