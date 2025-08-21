import algoliasearch from 'algoliasearch/lite';

export const ALGOLIA_APP_ID = import.meta.env.VITE_ALGOLIA_APP_ID || '';
export const ALGOLIA_API_KEY = import.meta.env.VITE_ALGOLIA_API_KEY || '';
export const ALGOLIA_INDEX_NAME = import.meta.env.VITE_ALGOLIA_INDEX_NAME || '';

export const searchClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_API_KEY);