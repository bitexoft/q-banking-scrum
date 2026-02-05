import React, { useState } from 'react';

interface SprintModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (sprintData: { name: string; weeks: string }) => void;
}

export const SprintModal: React.FC<SprintModalProps> = ({ isOpen, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [weeks, setWeeks] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ name, weeks });
        setName('');
        setWeeks('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-xl p-6 max-w-sm w-full border border-purple-500/30">
                <h3 className="text-xl font-bold mb-4 text-purple-400">Create New Sprint</h3>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2 text-gray-300">Sprint Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 bg-black/30 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                            placeholder="e.g. Sprint 5"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-2 text-gray-300">Date Range / Duration</label>
                        <input
                            type="text"
                            value={weeks}
                            onChange={(e) => setWeeks(e.target.value)}
                            className="w-full px-3 py-2 bg-black/30 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                            placeholder="e.g. Feb 01 - Feb 14"
                            required
                        />
                    </div>
                    <div className="flex gap-3">
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                        >
                            Create Sprint
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
