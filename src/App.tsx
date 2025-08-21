import { InstantSearch } from 'react-instantsearch';
import { AppLayout } from './components/Layout/AppLayout';
import { SearchPanel } from './components/Search/SearchPanel';
import { AgentPanel } from './components/Agent/AgentPanel';
import { InitialSearch } from './components/Search/InitialSearch';
import { SearchProvider } from './contexts/SearchContext';
import { searchClient, ALGOLIA_INDEX_NAME } from './services/algoliaConfig';

function App() {
  return (
    <SearchProvider>
      <InstantSearch 
        searchClient={searchClient} 
        indexName={ALGOLIA_INDEX_NAME}
        insights={false}
        future={{ preserveSharedStateOnUnmount: false }}
      >
        <InitialSearch />
        <AppLayout>
          <SearchPanel />
          <AgentPanel />
        </AppLayout>
      </InstantSearch>
    </SearchProvider>
  );
}

export default App;