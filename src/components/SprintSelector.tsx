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
}

export const SprintSelector: React.FC<SprintSelectorProps> = ({ sprints, selectedSprint, onSelect }) => (
    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {sprints.map((sprint, idx) => (
            <SprintTab
                key={sprint.id}
                sprint={sprint}
                isActive={selectedSprint === idx}
                onClick={() => onSelect(idx)}
            />
        ))}
    </div>
);
