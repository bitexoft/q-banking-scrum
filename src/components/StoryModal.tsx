import React, { useState, useEffect } from 'react';

interface Epic {
    id: string;
    name: string;
}

interface Assignee {
    id: string;
    name: string;
}

interface Story {
    id: string;
    title: string;
    status: 'todo' | 'in-progress' | 'done' | 'blocked';
    sp: number;
    priority: string;
    epic: string;
    assignee?: string;
    details?: string; // Manteniendo consistencia si se usaba description, pero el usuario pidió 'detalle'
}

interface StoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (story: any) => void;
    story: Story | null;
    epics?: Epic[];
    assignees?: Assignee[];
}

const priorities = ['P0', 'P1', 'P2'];
const statuses = ['todo', 'in-progress', 'done', 'blocked'];

export const StoryModal: React.FC<StoryModalProps> = ({ isOpen, onClose, onSave, story, epics = [], assignees = [] }) => {
    const [formData, setFormData] = useState({
        id: '',
        title: '',
        epic: epics.length > 0 ? epics[0].name : '',
        sp: 3,
        priority: 'P1',
        status: 'todo',
        assignee: assignees.length > 0 ? assignees[0].name : '',
        details: ''
    });

    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        if (story) {
            setFormData({
                id: story.id,
                title: story.title,
                epic: story.epic,
                sp: story.sp,
                priority: story.priority,
                status: story.status,
                assignee: story.assignee || (assignees.length > 0 ? assignees[0].name : ''),
                details: story.details || ''
            });
            setShowDetails(!!story.details);
        } else {
            // Reset form for new story (ID will be auto-generated)
            setFormData({
                id: '',
                title: '',
                epic: epics.length > 0 ? epics[0].name : '',
                sp: 3,
                priority: 'P1',
                status: 'todo',
                assignee: assignees.length > 0 ? assignees[0].name : '',
                details: ''
            });
            setShowDetails(false);
        }
    }, [story, epics, assignees]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-purple-500/30">
                <h3 className="text-xl font-bold mb-4 text-purple-400">
                    {story ? 'Edit Story' : 'Create New Story'}
                </h3>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Title</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-3 py-2 bg-black/30 border border-purple-500/30 rounded-lg text-white"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Epic</label>
                        <select
                            value={formData.epic}
                            onChange={(e) => setFormData({ ...formData, epic: e.target.value })}
                            className="w-full px-3 py-2 bg-black/30 border border-purple-500/30 rounded-lg text-white"
                        >
                            {epics.map(epic => (
                                <option key={epic.id} value={epic.name}>{epic.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Assignee</label>
                        <select
                            value={formData.assignee}
                            onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                            className="w-full px-3 py-2 bg-black/30 border border-purple-500/30 rounded-lg text-white"
                        >
                            {assignees.map(assignee => (
                                <option key={assignee.id} value={assignee.name}>{assignee.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Story Points</label>
                        <input
                            type="number"
                            min="1"
                            max="21"
                            value={formData.sp}
                            onChange={(e) => setFormData({ ...formData, sp: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 bg-black/30 border border-purple-500/30 rounded-lg text-white"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Priority</label>
                        <select
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                            className="w-full px-3 py-2 bg-black/30 border border-purple-500/30 rounded-lg text-white"
                        >
                            {priorities.map(p => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-2">Status</label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="w-full px-3 py-2 bg-black/30 border border-purple-500/30 rounded-lg text-white"
                        >
                            {statuses.map(s => (
                                <option key={s} value={s}>{s.replace('-', ' ')}</option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-6">
                        <button
                            type="button"
                            onClick={() => setShowDetails(!showDetails)}
                            className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
                        >
                            {showDetails ? '− Hide Details' : '+ Add Details'}
                        </button>

                        {showDetails && (
                            <textarea
                                value={formData.details}
                                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                                placeholder="Enter story details, acceptance criteria, etc..."
                                className="w-full mt-2 px-3 py-2 bg-black/30 border border-purple-500/30 rounded-lg text-white h-24 resize-none text-sm"
                            />
                        )}
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                        >
                            {story ? 'Save' : 'Create'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
