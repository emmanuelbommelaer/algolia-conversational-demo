#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import axios from 'axios';
import { config } from 'dotenv';

// Load environment variables
config();

interface AgentConfig {
  agent: {
    id: string;
    name: string;
    description: string;
    systemPrompt: string;
    model: {
      provider: string;
      name: string;
      temperature: number;
      maxTokens: number;
    };
    index: {
      name: string;
      searchParameters: Record<string, any>;
    };
    facets: Array<{
      attribute: string;
      label: string;
      type: string;
      limit?: number;
      sortBy?: string[];
    }>;
    responseTemplates?: Record<string, string>;
    behavior?: Record<string, boolean>;
  };
}

class AgentSyncManager {
  private configPath: string;
  private apiUrl: string;
  private appId: string;
  private apiKey: string;

  constructor() {
    this.configPath = path.join(process.cwd(), 'agent-config', 'agent.yaml');
    this.apiUrl = process.env.VITE_AGENT_API_URL || 'https://conversational-ai-dev.algolia.com';
    this.appId = process.env.VITE_ALGOLIA_APP_ID || '';
    this.apiKey = process.env.VITE_ALGOLIA_API_KEY || '';
  }

  /**
   * Check if API credentials are available
   */
  private requireApiCredentials(): void {
    if (!this.appId || !this.apiKey) {
      console.error('❌ Missing required environment variables: VITE_ALGOLIA_APP_ID or VITE_ALGOLIA_API_KEY');
      process.exit(1);
    }
  }

  /**
   * Load agent configuration from YAML file
   */
  loadConfig(): AgentConfig {
    try {
      const fileContents = fs.readFileSync(this.configPath, 'utf8');
      const config = yaml.load(fileContents) as AgentConfig;
      console.log('✅ Loaded agent configuration from', this.configPath);
      return config;
    } catch (error) {
      console.error('❌ Failed to load agent configuration:', error);
      process.exit(1);
    }
  }

  /**
   * Validate agent configuration
   */
  validateConfig(config: AgentConfig): boolean {
    const required = ['id', 'name', 'systemPrompt'];
    const missing = required.filter(field => !config.agent[field as keyof typeof config.agent]);
    
    if (missing.length > 0) {
      console.error('❌ Missing required fields:', missing.join(', '));
      return false;
    }

    if (!config.agent.id.match(/^[a-f0-9-]+$/)) {
      console.error('❌ Invalid agent ID format');
      return false;
    }

    console.log('✅ Configuration validated successfully');
    return true;
  }

  /**
   * Fetch current agent configuration from API
   */
  async fetchCurrentConfig(agentId: string): Promise<any> {
    this.requireApiCredentials();
    try {
      const response = await axios.get(
        `${this.apiUrl}/1/agents/${agentId}`,
        {
          headers: {
            'X-Algolia-Application-Id': this.appId,
            'X-Algolia-API-Key': this.apiKey,
          },
        }
      );
      console.log('✅ Fetched current agent configuration from API');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        console.log('ℹ️  Agent not found in API, will create new');
        return null;
      }
      console.error('❌ Failed to fetch agent configuration:', error);
      throw error;
    }
  }

  /**
   * Create or update agent configuration via API
   */
  async syncToAPI(config: AgentConfig): Promise<void> {
    this.requireApiCredentials();
    const agentId = config.agent.id;
    
    try {
      // Transform config to API format
      const apiPayload = {
        name: config.agent.name,
        description: config.agent.description,
        prompt: config.agent.systemPrompt,
        model: config.agent.model,
        indexName: config.agent.index.name,
        searchParameters: config.agent.index.searchParameters,
        facets: config.agent.facets,
        templates: config.agent.responseTemplates,
        behavior: config.agent.behavior,
      };

      // Check if agent exists
      const existingAgent = await this.fetchCurrentConfig(agentId);
      
      if (existingAgent) {
        // Update existing agent
        console.log('📝 Updating existing agent...');
        await axios.put(
          `${this.apiUrl}/1/agents/${agentId}`,
          apiPayload,
          {
            headers: {
              'X-Algolia-Application-Id': this.appId,
              'X-Algolia-API-Key': this.apiKey,
              'Content-Type': 'application/json',
            },
          }
        );
        console.log('✅ Agent configuration updated successfully');
      } else {
        // Create new agent
        console.log('🆕 Creating new agent...');
        await axios.post(
          `${this.apiUrl}/1/agents`,
          { ...apiPayload, id: agentId },
          {
            headers: {
              'X-Algolia-Application-Id': this.appId,
              'X-Algolia-API-Key': this.apiKey,
              'Content-Type': 'application/json',
            },
          }
        );
        console.log('✅ Agent created successfully');
      }

      console.log('\n🎉 Agent configuration synced successfully!');
      console.log(`📊 View in dashboard: https://dashboard.algolia.com/apps/${this.appId}/agent-studio/agents/${agentId}`);
      
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('❌ API Error:', error.response?.data || error.message);
        if (error.response?.status === 422) {
          console.log('\n💡 Note: The Algolia Agent API may require specific configuration.');
          console.log('   Please check the agent configuration in the Algolia dashboard.');
        }
      } else {
        console.error('❌ Failed to sync agent configuration:', error);
      }
      process.exit(1);
    }
  }

  /**
   * Pull agent configuration from API and save to file
   */
  async pullFromAPI(agentId: string): Promise<void> {
    this.requireApiCredentials();
    try {
      const apiConfig = await this.fetchCurrentConfig(agentId);
      
      if (!apiConfig) {
        console.error('❌ Agent not found in API');
        process.exit(1);
      }

      // Transform API response to our config format
      const localConfig: AgentConfig = {
        agent: {
          id: agentId,
          name: apiConfig.name || 'Unnamed Agent',
          description: apiConfig.description || '',
          systemPrompt: apiConfig.prompt || '',
          model: apiConfig.model || {
            provider: 'openai',
            name: 'gpt-4-turbo-preview',
            temperature: 0.7,
            maxTokens: 500,
          },
          index: {
            name: apiConfig.indexName || 'algoliaBNB',
            searchParameters: apiConfig.searchParameters || {},
          },
          facets: apiConfig.facets || [],
          responseTemplates: apiConfig.templates,
          behavior: apiConfig.behavior,
        },
      };

      // Save to file
      const yamlStr = yaml.dump(localConfig, { lineWidth: -1 });
      fs.writeFileSync(this.configPath, yamlStr);
      
      console.log('✅ Agent configuration pulled from API and saved to', this.configPath);
      
    } catch (error) {
      console.error('❌ Failed to pull agent configuration:', error);
      process.exit(1);
    }
  }

  /**
   * Compare local and remote configurations
   */
  async compareConfigs(config: AgentConfig): Promise<void> {
    this.requireApiCredentials();
    try {
      const remoteConfig = await this.fetchCurrentConfig(config.agent.id);
      
      if (!remoteConfig) {
        console.log('ℹ️  No remote configuration found');
        return;
      }

      console.log('\n📊 Configuration Comparison:');
      console.log('─'.repeat(50));
      
      // Compare key fields
      const fields = [
        { local: config.agent.name, remote: remoteConfig.name, label: 'Name' },
        { local: config.agent.description, remote: remoteConfig.description, label: 'Description' },
        { local: config.agent.model?.name, remote: remoteConfig.model?.name, label: 'Model' },
        { local: config.agent.index.name, remote: remoteConfig.indexName, label: 'Index' },
      ];

      fields.forEach(field => {
        const match = field.local === field.remote;
        const symbol = match ? '✅' : '⚠️';
        console.log(`${symbol} ${field.label}:`);
        if (!match) {
          console.log(`   Local:  ${field.local}`);
          console.log(`   Remote: ${field.remote}`);
        }
      });

      // Compare prompt length
      const localPromptLength = config.agent.systemPrompt?.length || 0;
      const remotePromptLength = remoteConfig.prompt?.length || 0;
      console.log(`\n📝 System Prompt:`);
      console.log(`   Local:  ${localPromptLength} characters`);
      console.log(`   Remote: ${remotePromptLength} characters`);
      
    } catch (error) {
      console.error('❌ Failed to compare configurations:', error);
    }
  }

  /**
   * Run the sync process
   */
  async run(command: string = 'push'): Promise<void> {
    console.log('🚀 Algolia Agent Configuration Sync\n');

    if (command === 'pull') {
      const agentId = process.env.VITE_AGENT_ID || '26cc363c-f96a-4170-bf36-46b734a6936a';
      await this.pullFromAPI(agentId);
      return;
    }

    const config = this.loadConfig();
    
    if (!this.validateConfig(config)) {
      process.exit(1);
    }

    if (command === 'validate') {
      console.log('✅ Configuration is valid');
      return;
    }

    if (command === 'compare') {
      await this.compareConfigs(config);
      return;
    }

    // Default: push to API
    await this.syncToAPI(config);
  }
}

// CLI handling
const command = process.argv[2] || 'push';
const validCommands = ['push', 'pull', 'validate', 'compare'];

if (!validCommands.includes(command)) {
  console.error(`❌ Invalid command: ${command}`);
  console.log('\nUsage: npm run agent:[command]');
  console.log('\nCommands:');
  console.log('  push     - Push local configuration to API (default)');
  console.log('  pull     - Pull configuration from API to local file');
  console.log('  validate - Validate local configuration');
  console.log('  compare  - Compare local and remote configurations');
  process.exit(1);
}

// Run the sync
const manager = new AgentSyncManager();
manager.run(command).catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});