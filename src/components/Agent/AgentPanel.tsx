import React from 'react';
import { SearchGuide } from './SearchGuide';

export const AgentPanel: React.FC = () => {
  return (
    <div className="w-full xl:w-96 bg-white rounded-xl shadow-lg border border-gray-100 flex flex-col h-auto" data-testid="agent-panel">
      <SearchGuide />
    </div>
  );
};

