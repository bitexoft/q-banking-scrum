import React, { useState, useEffect } from 'react';
import { ChevronIcon } from './Icons';

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
    epic: string;
    assignee?: string;
    details?: string;
}

interface Sprint {
    id: string;
    name: string;
    status?: 'active' | 'planned' | 'completed';
}

interface StoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (story: any, targetSprintId: string) => void;
    story: Story | null;
    epics?: Epic[];
    assignees?: Assignee[];
    sprints?: Sprint[];
    activeSprintId?: string;
    currentSprintId?: string;
}

const statuses = ['todo', 'in-progress', 'done', 'blocked'];

export const StoryModal: React.FC<StoryModalProps> = ({
    isOpen,
    onClose,
    onSave,
    story,
    epics = [],
    assignees = [],
    sprints = [],
    activeSprintId,
    currentSprintId
}) => {
    const [formData, setFormData] = useState({
        id: '',
        title: '',
        epic: epics.length > 0 ? epics[0].name : '',
        sp: 3,
        status: 'todo',
        assignee: assignees.length > 0 ? assignees[0].name : '',
        details: '',
        sprintId: ''
    });

    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        characteristics: true,
        details: false
    });

    useEffect(() => {
        if (story) {
            setFormData({
                id: story.id,
                title: story.title,
                epic: story.epic,
                sp: story.sp,
                status: story.status,
                assignee: story.assignee || (assignees.length > 0 ? assignees[0].name : ''),
                details: story.details || '',
                sprintId: currentSprintId || activeSprintId || ''
            });
            // Edit mode: details expanded, others collapsed
            setExpandedSections({
                characteristics: false,
                details: true
            });
        } else {
            // Creation mode: others expanded, details collapsed
            setFormData({
                id: '',
                title: '',
                epic: epics.length > 0 ? epics[0].name : '',
                sp: 3,
                status: 'todo',
                assignee: assignees.length > 0 ? assignees[0].name : '',
                details: '',
                sprintId: activeSprintId || (sprints.find(s => s.status === 'active')?.id) || (sprints.length > 0 ? sprints[0].id : '')
            });
            setExpandedSections({
                characteristics: true,
                details: false
            });
        }
    }, [story, epics, assignees, sprints, activeSprintId, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { sprintId, ...storyData } = formData;
        onSave(storyData, sprintId);
        onClose();
    };

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    if (!isOpen) return null;

    const SectionHeader = ({ id, title }: { id: string; title: string }) => (
        <button
            type="button"
            onClick={() => toggleSection(id)}
            className="w-full flex items-center justify-between py-2 mb-2 text-purple-400 hover:text-purple-300 transition-colors border-b border-purple-500/10"
        >
            <span className="text-sm font-semibold uppercase tracking-wider">{title}</span>
            <div className={`transition-transform duration-200 ${expandedSections[id] ? 'rotate-180' : ''}`}>
                <ChevronIcon />
            </div>
        </button>
    );

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900/90 rounded-2xl p-6 max-w-md w-full border border-purple-500/30 shadow-2xl flex flex-col max-h-[90vh]">
                <h3 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                    {story ? 'Edit Story' : 'Create New Story'}
                </h3>

                <form onSubmit={handleSubmit} className="overflow-y-auto pr-2 custom-scrollbar">
                    {/* Characteristics Section */}
                    <div className="mb-6">
                        <SectionHeader id="characteristics" title="Characteristics" />
                        <div className={`space-y-4 overflow-hidden transition-all duration-300 ${expandedSections.characteristics ? 'max-h-[600px] opacity-100 mt-4 pb-2' : 'max-h-0 opacity-0'}`}>
                            <div>
                                <label className="block text-xs font-medium mb-1.5 text-gray-400">Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-2 bg-black/40 border border-purple-500/20 rounded-xl text-white focus:border-purple-500/50 outline-none transition-all"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium mb-1.5 text-gray-400">Epic</label>
                                    <select
                                        value={formData.epic}
                                        onChange={(e) => setFormData({ ...formData, epic: e.target.value })}
                                        className="w-full px-4 py-2 bg-black/40 border border-purple-500/20 rounded-xl text-white focus:border-purple-500/50 outline-none transition-all text-sm"
                                    >
                                        {epics.map(epic => (
                                            <option key={epic.id} value={epic.name}>{epic.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium mb-1.5 text-gray-400">Sprint Target</label>
                                    <select
                                        value={formData.sprintId}
                                        onChange={(e) => {
                                            const newSprintId = e.target.value;
                                            const updates: any = { sprintId: newSprintId };
                                            if (newSprintId === 'backlog') {
                                                updates.status = 'todo';
                                            }
                                            setFormData({ ...formData, ...updates });
                                        }}
                                        className="w-full px-4 py-2 bg-black/40 border border-purple-500/20 rounded-xl text-white font-semibold text-purple-300 focus:border-purple-500/50 outline-none transition-all text-sm"
                                    >
                                        {sprints.map(sprint => (
                                            <option key={sprint.id} value={sprint.id}>
                                                {sprint.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium mb-1.5 text-gray-400">Assignee</label>
                                    <select
                                        value={formData.assignee}
                                        onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                                        className="w-full px-4 py-2 bg-black/40 border border-purple-500/20 rounded-xl text-white focus:border-purple-500/50 outline-none transition-all text-sm"
                                    >
                                        {assignees.map(assignee => (
                                            <option key={assignee.id} value={assignee.name}>{assignee.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium mb-1.5 text-gray-400">Story Points</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="21"
                                        value={formData.sp}
                                        onChange={(e) => setFormData({ ...formData, sp: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2 bg-black/40 border border-purple-500/20 rounded-xl text-white focus:border-purple-500/50 outline-none transition-all text-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className={`block text-xs font-medium mb-1.5 ${formData.sprintId === 'backlog' ? 'text-gray-600' : 'text-gray-400'}`}>
                                    Status {formData.sprintId === 'backlog' && <span className="text-[10px] text-purple-400 font-normal ml-2">(To-Do for Backlog)</span>}
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                    disabled={formData.sprintId === 'backlog'}
                                    className={`w-full px-4 py-2 bg-black/40 border border-purple-500/20 rounded-xl text-white focus:border-purple-500/50 outline-none transition-all ${formData.sprintId === 'backlog' ? 'opacity-50 cursor-not-allowed border-dashed' : ''}`}
                                >
                                    {statuses.map(s => (
                                        <option key={s} value={s}>{s.replace('-', ' ')}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Details Section */}
                    <div className="mb-8">
                        <SectionHeader id="details" title="Details" />
                        <div className={`overflow-hidden transition-all duration-300 ${expandedSections.details ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                            <textarea
                                value={formData.details}
                                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                                placeholder="Enter story details, acceptance criteria, etc..."
                                className="w-full px-4 py-3 bg-black/40 border border-purple-500/20 rounded-xl text-white h-40 resize-none text-sm focus:border-purple-500/50 outline-none transition-all custom-scrollbar"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 mt-2 sticky bottom-0 bg-slate-900/90 pt-4 pb-2">
                        <button
                            type="submit"
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-500/20 active:scale-95"
                        >
                            {story ? 'Save Changes' : 'Create Story'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 bg-white/5 text-gray-300 rounded-xl font-bold hover:bg-white/10 transition-all active:scale-95"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
