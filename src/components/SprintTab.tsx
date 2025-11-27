import React from 'react';

interface Sprint {
    id: string;
    name: string;
    weeks: string;
}

interface SprintTabProps {
    sprint: Sprint;
    isActive: boolean;
    onClick: () => void;
}

export const SprintTab: React.FC<SprintTabProps> = ({ sprint, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all ${isActive
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50'
                : 'bg-white/10 text-purple-300 hover:bg-white/20'
            }`}
    >
        <div className="text-sm">{sprint.name}</div>
        <div className="text-xs opacity-75">Semanas {sprint.weeks}</div>
    </button>
);
