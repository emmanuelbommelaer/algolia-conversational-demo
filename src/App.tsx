import React from 'react';
import { AppLayout } from './components/Layout/AppLayout';
import { SearchPanel } from './components/Search/SearchPanel';
import { AgentPanel } from './components/Agent/AgentPanel';
import { SearchProvider } from './contexts/SearchContext';

function App() {
  return (
    <SearchProvider>
      <AppLayout>
        <SearchPanel />
        <AgentPanel />
      </AppLayout>
    </SearchProvider>
  );
}

export default App;