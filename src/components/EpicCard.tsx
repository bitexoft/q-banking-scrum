import React from 'react';
import * as Icons from './Icons';

// Map icon names to components
const iconMap: Record<string, React.ComponentType> = {
    BookIcon: Icons.BookIcon,
    SmartphoneIcon: Icons.SmartphoneIcon,
    DollarIcon: Icons.DollarIcon,
    LinkIcon: Icons.LinkIcon,
    ZapIcon: Icons.ZapIcon,
    CalendarIcon: Icons.CalendarIcon,
    CircleIcon: Icons.CircleIcon,
    PlayIcon: Icons.PlayIcon,
    CheckIcon: Icons.CheckIcon,
    TrendingIcon: Icons.TrendingIcon
};

interface Epic {
    id: string;
    name: string;
    iconName: string;
    color: string;
    total: number;
}

interface EpicCardProps {
    epic: Epic;
    onEdit: (epic: Epic) => void;
    onDelete: (epic: Epic) => void;
}

export const EpicCard: React.FC<EpicCardProps> = ({ epic, onEdit, onDelete }) => {
    const Icon = iconMap[epic.iconName]; // Use iconName string

    return (
        <div className="bg-black/30 rounded-lg p-4 border border-white/10 hover:border-white/20 transition-all hover:-translate-y-1 group relative">
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <button
                    onClick={(e) => { e.stopPropagation(); onEdit(epic); }}
                    className="p-1.5 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/40 transition-colors"
                    title="Edit Epic"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(epic); }}
                    className="p-1.5 bg-red-500/20 text-red-400 rounded hover:bg-red-500/40 transition-colors"
                    title="Delete Epic"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                </button>
            </div>
            <div className="flex items-start gap-3">
                <div className={`${epic.color} p-2 rounded-lg`}>
                    <div className="text-white">
                        {Icon && <Icon />}
                    </div>
                </div>
                <div className="flex-1">
                    <div className="font-semibold text-sm mb-1">{epic.name}</div>
                    <div className="text-gray-400 text-xs">{epic.total} Story Points</div>
                </div>
            </div>
        </div>
    );
};
