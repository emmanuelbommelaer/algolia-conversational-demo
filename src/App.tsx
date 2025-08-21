import { InstantSearch } from 'react-instantsearch';
import { AppLayout } from './components/Layout/AppLayout';
import { SearchPanel } from './components/Search/SearchPanel';
import { AgentPanel } from './components/Agent/AgentPanel';
import { SearchProvider } from './contexts/SearchContext';
import { searchClient, ALGOLIA_INDEX_NAME } from './services/algoliaConfig';

function App() {
  return (
    <SearchProvider>
      <InstantSearch searchClient={searchClient} indexName={ALGOLIA_INDEX_NAME}>
        <AppLayout>
          <SearchPanel />
          <AgentPanel />
        </AppLayout>
      </InstantSearch>
    </SearchProvider>
  );
}

export default App;