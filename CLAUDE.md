# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development rules
- Test driven development: for each feature, write a test first, then build it.
- Keep it simple: make the least possible edits to respect the specifications.
- Commit small & often: every time you've built a feature or made significant changes to the codebase, create a commit.

## Essential Commands

```bash
# Development
npm run dev          # Start Vite dev server on http://localhost:5173

# Build & Production
npm run build        # TypeScript check + Vite production build
npm run preview      # Preview production build locally

# Code Quality
npm run lint         # Run ESLint on all files

# Agent Management
npm run agent:edit     # Open agent configuration for editing
npm run agent:validate # Validate agent.json syntax
npm run agent:compare  # Compare local vs remote configuration
npm run agent:push     # Deploy local config to Algolia API
```

## Architecture Overview

This is a React application demonstrating Algolia's conversational search capabilities with a dual-panel interface:

### Core Integration Points

1. **Algolia InstantSearch** (left panel): Traditional faceted search using `react-instantsearch` hooks
   - `src/services/algoliaConfig.ts`: Algolia client configuration
   - Search widgets in `src/components/Search/`: SearchBox, Filters, ResultsList
   - Currently uses Algolia's demo "instant_search" index

2. **Algolia Agent Studio** (right panel): Conversational AI interface
   - `src/services/agentService.ts`: Agent API client (dev environment: https://conversational-ai-dev.algolia.com)
   - Chat components in `src/components/Agent/`: AgentPanel, ChatThread, MessageBubble
   - Currently using simulated responses - real API integration pending

3. **State Synchronization**:
   - `src/contexts/SearchContext.tsx`: Shared state between search and agent panels
   - Agent suggestions can update search filters
   - Search state provides context to agent

### Key Implementation Details

- **Split Panel Layout**: 60% search results, 40% chat interface (`src/components/Layout/AppLayout.tsx`)
- **Filter Application**: Agent suggestions generate clickable filter chips that update InstantSearch
- **Type Definitions**: All data models in `src/types/index.ts`
- **Styling**: Tailwind CSS with utility classes

## Environment Configuration

Required environment variables (see `.env.example`):
- `VITE_ALGOLIA_APP_ID`: Algolia application ID
- `VITE_ALGOLIA_API_KEY`: Algolia search API key
- `VITE_ALGOLIA_INDEX_NAME`: Index to search
- `VITE_AGENT_ID`: Agent Studio agent ID
- `VITE_AGENT_API_KEY`: Agent Studio API key

## Pending Work

- Complete real Algolia Agent Studio API integration (currently using mock responses)
- Implement bidirectional state sync between panels
- Add proper error handling and loading states
- Create comprehensive README with setup instructions
