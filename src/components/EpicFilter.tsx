import React from 'react';

interface Epic {
    id: string;
    name: string;
}

interface EpicFilterProps {
    filter: string;
    onFilterChange: (filter: string) => void;
    epics?: Epic[];
}

export const EpicFilter: React.FC<EpicFilterProps> = ({ filter, onFilterChange, epics = [] }) => {
    return (
        <div className="flex gap-2 mb-6 flex-wrap">
            <button
                onClick={() => onFilterChange('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'all' ? 'bg-purple-600 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
            >
                All
            </button>
            {epics.map(epic => (
                <button
                    key={epic.id}
                    onClick={() => onFilterChange(epic.name)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === epic.name ? 'bg-purple-600 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                >
                    {epic.name}
                </button>
            ))}
        </div>
    );
};
