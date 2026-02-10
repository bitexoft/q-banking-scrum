import { PencilIcon, TrashIcon } from './Icons';

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


interface SprintTabProps {
    sprint: Sprint;
    isActive: boolean;
    onClick: () => void;
    onEdit?: (sprint: Sprint) => void;
    onDelete?: (sprint: Sprint) => void;
}

export const SprintTab: React.FC<SprintTabProps> = ({ sprint, isActive, onClick, onEdit, onDelete }) => (
    <div className="relative group">
        <button
            onClick={onClick}
            className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all relative ${isActive
                ? (sprint.id === 'discovery' ? 'bg-orange-500/40 text-orange-100 shadow-lg shadow-orange-500/30 scale-105 border border-orange-500/30' : 'bg-purple-600 text-white shadow-lg shadow-purple-500/50 scale-105')
                : (sprint.id === 'discovery' ? 'bg-orange-600/5 text-orange-300/60 hover:bg-orange-600/10 border-orange-500/10 border' : 'bg-white/10 text-purple-300 hover:bg-white/20')
                }`}
        >
            <div className={`text-sm flex items-center gap-2 justify-center ${sprint.status === 'active' ? 'text-green-400 animate-pulse font-bold' : ''}`}>
                {sprint.name}
            </div>
            <div className="text-xs opacity-75 flex items-center gap-2 justify-center mt-0.5">
                {!['backlog', 'discovery'].includes(sprint.id) && (
                    <>
                        <span>{sprint.weeks}</span>
                        <span className="text-[10px] font-mono bg-black/30 rounded px-1 py-0.5 text-purple-200 border border-purple-500/10">
                            {sprint.stories.filter(s => s.status === 'done').reduce((sum, s) => sum + s.sp, 0)}/{sprint.stories.reduce((sum, s) => sum + s.sp, 0)}
                        </span>
                    </>
                )}
            </div>
        </button>
        <div className="absolute top-1 right-1 flex gap-1 items-center opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit && !['backlog', 'discovery'].includes(sprint.id) && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit(sprint);
                    }}
                    className="p-1 bg-purple-600/80 text-white rounded hover:bg-purple-700"
                    title="Edit sprint"
                >
                    <PencilIcon />
                </button>
            )}
            {onDelete && !['backlog', 'discovery'].includes(sprint.id) && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(sprint);
                    }}
                    className="p-1 bg-red-600/80 text-white rounded hover:bg-red-700"
                    title="Delete sprint"
                >
                    <TrashIcon />
                </button>
            )}
        </div>
    </div>
);
