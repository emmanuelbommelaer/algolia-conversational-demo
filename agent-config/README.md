# Agent Configuration as Code

This directory contains the Algolia Agent configuration that can be edited locally and synced with the Algolia API.

## 📝 Editing the Agent

### Local Editing

1. **Edit the configuration file:**
   ```bash
   npm run agent:edit
   ```
   Or manually edit `agent-config/agent.yaml`

2. **Key sections to modify:**
   - `systemPrompt`: The main agent instructions
   - `facets`: Configure which facets to use
   - `responseTemplates`: Default response messages
   - `model`: AI model settings

### Available Commands

```bash
# Validate the local configuration
npm run agent:validate

# Compare local vs remote configuration
npm run agent:compare

# Push local changes to Algolia API
npm run agent:push

# Pull remote configuration to local file
npm run agent:pull

# Open configuration in VS Code
npm run agent:edit
```

## 🔄 Sync Workflow

### Manual Sync

1. Edit `agent.yaml` with your changes
2. Validate: `npm run agent:validate`
3. Compare: `npm run agent:compare`
4. Push: `npm run agent:push`

### GitHub Actions Sync

The repository includes a GitHub Action that can:
- Automatically validate configuration on push
- Compare local and remote configs
- Sync to API when manually triggered

To sync via GitHub Actions:
1. Go to Actions → "Agent Configuration Management"
2. Click "Run workflow"
3. Set "Sync configuration to Algolia API" to "true"
4. Run the workflow

## 🎯 Configuration Structure

### System Prompt
The most important part - defines how the agent behaves:

```yaml
systemPrompt: |
  You are an intelligent Airbnb search assistant...
  [Your instructions here]
```

### Facets
Configure which search facets the agent can suggest:

```yaml
facets:
  - attribute: city
    label: "Location"
    type: "refinementList"
    limit: 10
```

### Model Settings
Configure the AI model:

```yaml
model:
  provider: "openai"
  name: "gpt-4.1"
  temperature: 0.7
  maxTokens: 500
```

## 🧪 Testing Changes

After editing the agent:

1. **Test locally** by running the app:
   ```bash
   npm run dev
   ```

2. **Monitor agent responses** in the browser console

3. **Check fallback behavior** - the app uses fallback when API fails

## 🔐 Security

- Never commit API keys to the repository
- Use environment variables for sensitive data
- The GitHub Action uses repository secrets for API keys

## 📊 Monitoring

View your agent in the Algolia dashboard:
- [Agent Dashboard](https://dashboard.algolia.com/apps/8W4UB9R8JC/agent-studio/agents/26cc363c-f96a-4170-bf36-46b734a6936a)

## 🤝 Best Practices

1. **Version Control**: Commit agent changes with descriptive messages
2. **Testing**: Always test locally before pushing to API
3. **Documentation**: Update comments in the YAML when changing behavior
4. **Incremental Changes**: Make small, focused changes
5. **Validation**: Always validate before pushing

## 🐛 Troubleshooting

### Configuration won't validate
- Check YAML syntax (proper indentation)
- Ensure required fields are present
- Verify agent ID format

### Push fails with 422 error
- The agent API may have specific requirements
- Check the Algolia dashboard for error details
- Ensure your API key has write permissions

### Changes don't appear in app
- Clear browser cache
- Check browser console for errors
- Verify the agent ID matches in `.env`

## 📚 Resources

- [Algolia Agent Studio Documentation](https://www.algolia.com/doc/guides/algolia-ai/agent-studio/)
- [Agent API Reference](https://www.algolia.com/doc/api-reference/api-methods/agent/)
- [YAML Syntax Guide](https://yaml.org/spec/1.2/spec.html)
