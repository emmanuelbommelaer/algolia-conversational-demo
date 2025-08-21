# Agent Configuration

This directory contains the configuration for the Algolia conversational agent used in this demo application.

## Configuration File

**`agent.json`** - Contains the agent configuration in JSON format that matches the Algolia Agent API structure.

### Structure

```json
{
  "name": "Agent display name",
  "description": "Agent description",
  "instructions": "System prompt for the agent",
  "model": "gpt-4.1",
  "config": {
    "temperature": 0.7,
    "max_tokens": 500
  }
}
```

## Managing the Agent

### Local Development

1. **Edit Configuration**: Modify `agent.json` directly or use:
   ```bash
   npm run agent:edit
   ```

2. **Validate Configuration**:
   ```bash
   npm run agent:validate
   ```

3. **Compare with Remote**:
   ```bash
   npm run agent:compare
   ```

4. **Push Changes**:
   ```bash
   npm run agent:push
   ```

### Automatic Deployment

The agent configuration is automatically deployed when:
- You push changes to the `agent-config/` directory on the `master` branch
- The GitHub Action workflow validates and syncs the configuration

### Manual Deployment

If you have the algobot CLI installed globally:

```bash
# Install algobot CLI
npm install -g @algolia/algobot-cli

# Set environment variables
export ALGOLIA_APP_ID="your_app_id"
export ALGOLIA_API_KEY="your_api_key"

# Deploy configuration
algobot agents patch 26cc363c-f96a-4170-bf36-46b734a6936a --json agent-config/agent.json
```

## Environment Variables

Make sure these are set in your `.env` file:
- `VITE_AGENT_ID` - The agent ID (currently: `26cc363c-f96a-4170-bf36-46b734a6936a`)
- `VITE_ALGOLIA_APP_ID` - Your Algolia application ID
- `VITE_ALGOLIA_API_KEY` - Your Algolia API key

## Workflow

1. **Edit** `agent.json` with your changes
2. **Validate** locally with `npm run agent:validate`
3. **Commit** and push to trigger automatic deployment
4. **Monitor** the GitHub Action for deployment status

## Dashboard Links

- [View Agent in Dashboard](https://dashboard.algolia.com/apps/8W4UB9R8JC/agent-studio/agents/26cc363c-f96a-4170-bf36-46b734a6936a)
- [Edit Agent Configuration](https://dashboard.algolia.com/apps/8W4UB9R8JC/agent-studio/agents/26cc363c-f96a-4170-bf36-46b734a6936a/edit)

## Migration from YAML

This configuration was previously stored as `agent.yaml` but has been migrated to JSON for better API compatibility and simpler tooling.