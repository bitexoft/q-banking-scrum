import React from 'react';
import { SprintTab } from './SprintTab';

interface Sprint {
    id: string;
    name: string;
    weeks: string;
    stories?: any[]; // We don't need full story details here
}

interface SprintSelectorProps {
    sprints: Sprint[];
    selectedSprint: number;
    onSelect: (index: number) => void;
    onAddSprint: () => void;
}

export const SprintSelector: React.FC<SprintSelectorProps> = ({ sprints, selectedSprint, onSelect, onAddSprint }) => (
    <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {sprints.map((sprint, idx) => (
            <SprintTab
                key={sprint.id}
                sprint={sprint}
                isActive={selectedSprint === idx}
                onClick={() => onSelect(idx)}
            />
        ))}
        <button
            onClick={onAddSprint}
            className="px-4 py-2 bg-purple-600/20 text-purple-300 rounded-lg text-sm font-semibold hover:bg-purple-600/40 transition-colors border border-purple-500/30 whitespace-nowrap"
        >
            + New Sprint
        </button>
    </div>
);
