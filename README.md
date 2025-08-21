# Algolia Conversational Search Demo

A React application demonstrating Algolia's conversational search capabilities with a dual-panel interface combining traditional faceted search with AI-powered conversational assistance.

## 🚀 Features

- **Dual Panel Interface**: Split-screen design with search results (60%) and AI chat (40%)
- **Real-time Search**: InstantSearch integration with faceted filtering
- **Conversational AI**: Agent Studio integration for natural language queries
- **State Synchronization**: Bidirectional sync between search filters and agent suggestions
- **Responsive Design**: Mobile-friendly layout with collapsible panels
- **TypeScript**: Full type safety throughout the application

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Build Tool**: Vite
- **Search**: Algolia InstantSearch React
- **AI**: Algolia Agent Studio (Dev Environment)
- **HTTP Client**: Axios

## 📦 Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/emmanuelbommelaer/algolia-conversational-demo.git
   cd algolia-conversational-demo
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your Algolia credentials:
   ```bash
   # Algolia Configuration
   VITE_ALGOLIA_APP_ID=your_algolia_app_id
   VITE_ALGOLIA_API_KEY=your_algolia_search_api_key
   VITE_ALGOLIA_INDEX_NAME=your_index_name

   # Algolia Agent Configuration (Dev Environment)
   VITE_AGENT_API_URL=https://conversational-ai-dev.algolia.com
   VITE_AGENT_ID=your_agent_id
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

   Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🏗️ Architecture

### Core Components

- **SearchPanel**: Left panel with InstantSearch widgets (SearchBox, Filters, Results)
- **AgentPanel**: Right panel with conversational AI interface
- **SearchContext**: Shared state management for search/agent synchronization
- **AgentService**: HTTP client for Agent Studio API integration

### Data Flow

1. User searches or applies filters → InstantSearch updates results
2. Search state syncs to React Context → Available to Agent
3. User chats with Agent → Agent analyzes current search context
4. Agent suggests filters/queries → User can apply suggestions
5. Applied suggestions update search state → Results refresh

## 🔧 Development Commands

```bash
# Development
npm run dev          # Start dev server on http://localhost:5173

# Build & Production
npm run build        # TypeScript check + Vite production build
npm run preview      # Preview production build locally

# Code Quality
npm run lint         # Run ESLint on all files
```

## 🌐 Environment Variables

| Variable | Description | Required |
|----------|-------------|---------|
| `VITE_ALGOLIA_APP_ID` | Your Algolia Application ID | ✅ |
| `VITE_ALGOLIA_API_KEY` | Algolia Search API Key (public) | ✅ |
| `VITE_ALGOLIA_INDEX_NAME` | Name of your search index | ✅ |
| `VITE_AGENT_ID` | Agent Studio Agent ID | ✅ |
| `VITE_AGENT_API_URL` | Agent API URL (defaults to dev) | ❌ |

## 📱 Usage Examples

**Traditional Search**:
- Type queries in the search box
- Use sidebar filters for categories, price, etc.
- Browse paginated results

**Conversational Search**:
- "Show me laptops under $1000"
- "I need a gaming mouse with RGB lighting"
- "Find wireless headphones with noise cancellation"

The agent will suggest relevant filters that you can apply with one click.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Run tests and linting: `npm run lint`
5. Commit your changes: `git commit -m 'Add feature'`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.
