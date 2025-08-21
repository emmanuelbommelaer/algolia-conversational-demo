# Agent Configuration Management

## GitHub Action for Agent Links

This repository includes a GitHub Action that automatically generates links to view and edit the Algolia Agent configuration.

### How It Works

The action runs automatically when:
- You manually trigger it (workflow_dispatch)
- Changes are pushed to agent-related files
- Pull requests modify agent configuration

### Generated Links

The action creates links to:
1. **Agent Dashboard** - View the agent configuration and analytics
2. **Agent Editor** - Edit the agent's prompt, settings, and behavior

### Accessing the Links

#### In GitHub Actions:
1. Go to the "Actions" tab in your repository
2. Click on "Agent Configuration Link" workflow
3. Select a workflow run
4. View the summary for direct links

#### In Pull Requests:
- The action automatically comments on PRs with the agent links

### Manual Trigger

To manually generate the links:
1. Go to Actions → Agent Configuration Link
2. Click "Run workflow"
3. Check the workflow summary for links

### Local Configuration

The agent configuration uses these environment variables:
```env
VITE_AGENT_ID=26cc363c-f96a-4170-bf36-46b734a6936a
VITE_ALGOLIA_APP_ID=8W4UB9R8JC
```

### Agent Dashboard URL Format

```
https://dashboard.algolia.com/apps/{APP_ID}/agent-studio/agents/{AGENT_ID}
```

### Testing the Agent

You can test the agent API directly:

```bash
curl -X POST \
  https://conversational-ai-dev.algolia.com/1/agents/26cc363c-f96a-4170-bf36-46b734a6936a/completions \
  -H 'X-Algolia-Application-Id: 8W4UB9R8JC' \
  -H 'X-Algolia-API-Key: YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"messages": [{"role": "user", "content": "Help me find an Airbnb in Paris"}]}'
```

## Configuring the Agent

To configure the agent for guided search:

1. Access the agent editor using the generated link
2. Update the agent's system prompt to handle faceted search guidance
3. Configure the agent to return structured facet suggestions
4. Test the agent responses in the dashboard

### Recommended Agent Prompt Structure

```
You are a helpful Airbnb search assistant. Guide users through their search by:
1. Suggesting relevant location filters
2. Recommending property types based on their needs
3. Helping with price range selection
4. Providing contextual search guidance

Always return structured suggestions for facets when appropriate.
```