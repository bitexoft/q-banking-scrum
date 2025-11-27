import React from 'react';
import { PlayIcon, CheckIcon, CircleIcon, BlockedIcon } from './Icons';

interface Story {
    id: string;
    title: string;
    status: 'todo' | 'in-progress' | 'done' | 'blocked';
    sp: number;
    priority: string;
    epic: string;
    assignee?: string;
}

interface Epic {
    id: string;
    name: string;
    iconName: string;
    color: string;
    total: number;
}

interface StoryCardProps {
    story: Story;
    onClick: (id: string) => void;
    onEdit: (story: Story) => void;
    onDelete: (id: string) => void;
    epics?: Epic[];
}

const getStatusIcon = (status: Story['status']) => {
    switch (status) {
        case 'done': return <CheckIcon />;
        case 'in-progress': return <PlayIcon />;
        case 'blocked': return <BlockedIcon />;
        default: return <CircleIcon />;
    }
};

const getStatusColor = (status: Story['status']) => {
    switch (status) {
        case 'done': return 'text-green-500';
        case 'in-progress': return 'text-blue-500';
        case 'blocked': return 'text-red-500';
        default: return 'text-gray-300';
    }
};

const getStatusBadge = (status: Story['status']) => {
    const styles: Record<string, string> = {
        'done': 'bg-green-100 text-green-800',
        'in-progress': 'bg-blue-100 text-blue-800',
        'blocked': 'bg-red-100 text-red-800',
        'todo': 'bg-gray-100 text-gray-600'
    };
    return styles[status] || styles.todo;
};

const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
        'P0': 'text-red-600 font-bold',
        'P1': 'text-orange-500 font-semibold',
        'P2': 'text-yellow-600'
    };
    return colors[priority] || 'text-gray-500';
};

// Convert Tailwind color class to transparent version
const getEpicColorWithTransparency = (color: string) => {
    const colorMap: Record<string, string> = {
        'bg-purple-500': 'bg-purple-500/20 text-purple-300',
        'bg-purple-600': 'bg-purple-600/20 text-purple-300',
        'bg-blue-500': 'bg-blue-500/20 text-blue-300',
        'bg-green-500': 'bg-green-500/20 text-green-300',
        'bg-orange-500': 'bg-orange-500/20 text-orange-300',
        'bg-pink-500': 'bg-pink-500/20 text-pink-300',
        'bg-red-500': 'bg-red-500/20 text-red-300',
        'bg-yellow-500': 'bg-yellow-500/20 text-yellow-300',
    };
    return colorMap[color] || 'bg-white/5 text-gray-400';
};

export const StoryCard: React.FC<StoryCardProps> = ({ story, onClick, onEdit, onDelete, epics = [] }) => {
    // Find the epic color
    const epic = epics.find(e => e.name === story.epic);
    const epicColorClass = epic ? getEpicColorWithTransparency(epic.color) : 'bg-white/5 text-gray-400';

    return (
        <div className="bg-black/30 rounded-lg p-4 border border-white/10 hover:border-purple-500/50 transition-all cursor-pointer group">
            <div className="flex items-start gap-4">
                <div className={`mt-1 ${getStatusColor(story.status)}`} onClick={(e) => {
                    e.stopPropagation();
                    onClick(story.id);
                }}>
                    {getStatusIcon(story.status)}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                            <span className="text-purple-400 text-sm font-mono">{story.id}</span>
                            <h3 className="font-semibold mt-1">{story.title}</h3>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadge(story.status)}`}>
                                {story.status.replace('-', ' ').toUpperCase()}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${getPriorityColor(story.priority)}`}>
                                {story.priority}
                            </span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit(story);
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 bg-purple-600/20 text-purple-400 rounded text-xs font-semibold hover:bg-purple-600/40"
                            >
                                Edit
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(story.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 bg-red-600/20 text-red-400 rounded text-xs font-semibold hover:bg-red-600/40"
                            >
                                Delete
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                            <span className="font-semibold text-purple-400">{story.sp}</span> SP
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${epicColorClass}`}>
                            {story.epic}
                        </span>
                        {story.assignee && (
                            <span className="px-2 py-1 bg-gray-500/20 text-gray-300 rounded text-xs font-semibold">
                                👤 {story.assignee}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
