import React from 'react';
import { SprintTab } from './SprintTab';

interface Story {
    id: string;
    title: string;
    status: 'todo' | 'in-progress' | 'done' | 'blocked';
    sp: number;
    epic: string;
    assignee?: string;
}

interface Sprint {
    id: string;
    name: string;
    weeks: string;
    stories: Story[];
    status?: 'active' | 'planned' | 'completed';
}


interface SprintSelectorProps {
    sprints: Sprint[];
    selectedSprint: number;
    onSelect: (index: number) => void;
    onAddSprint: () => void;
    onEditSprint?: (sprint: Sprint) => void;
    onDeleteSprint?: (sprint: Sprint) => void;
}

export const SprintSelector: React.FC<SprintSelectorProps> = ({ sprints, selectedSprint, onSelect, onAddSprint, onEditSprint, onDeleteSprint }) => (
    <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {sprints.map((sprint, idx) => (
            <SprintTab
                key={sprint.id}
                sprint={sprint}
                isActive={selectedSprint === idx}
                onClick={() => onSelect(idx)}
                onEdit={onEditSprint}
                onDelete={onDeleteSprint}
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
