import React from 'react';

interface Sprint {
    id: string;
    name: string;
    weeks: string;
    status?: string;
}

interface SprintTabProps {
    sprint: Sprint;
    isActive: boolean;
    onClick: () => void;
}

export const SprintTab: React.FC<SprintTabProps> = ({ sprint, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all relative ${isActive
            ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50 scale-105'
            : 'bg-white/10 text-purple-300 hover:bg-white/20'
            }`}
    >
        {sprint.status === 'active' && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
        )}
        <div className="text-sm flex items-center gap-2">
            {sprint.name}
        </div>
        <div className="text-xs opacity-75">Semanas {sprint.weeks}</div>
    </button>
);
