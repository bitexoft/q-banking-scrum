import React, { useState, useEffect } from 'react';
import * as Icons from './Icons';

const iconOptions: string[] = [
    'BookIcon',
    'SmartphoneIcon',
    'DollarIcon',
    'LinkIcon',
    'ZapIcon',
    'CalendarIcon',
    'CircleIcon',
    'PlayIcon',
    'CheckIcon',
    'TrendingIcon'
];

const colorOptions: string[] = [
    'bg-purple-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-orange-500'
];

interface Epic {
    id: string;
    name: string;
    iconName: string;
    color: string;
    total: number;
}

interface FormData {
    name: string;
    iconName: string;
    color: string;
    total: number;
}

interface EpicModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: FormData) => void;
    epic: Epic | null;
}

export const EpicModal: React.FC<EpicModalProps> = ({ isOpen, onClose, onSave, epic }) => {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        iconName: 'BookIcon',
        color: 'bg-purple-500',
        total: 0
    });

    useEffect(() => {
        if (epic) {
            setFormData({
                name: epic.name,
                iconName: epic.iconName,
                color: epic.color,
                total: epic.total || 0
            });
        } else {
            setFormData({
                name: '',
                iconName: 'BookIcon',
                color: 'bg-purple-500',
                total: 0
            });
        }
    }, [epic, isOpen]);

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
                    {epic ? 'Edit Epic' : 'Create New Epic'}
                </h3>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 bg-black/30 border border-purple-500/30 rounded-lg text-white"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Icon</label>
                        <div className="grid grid-cols-5 gap-2">
                            {iconOptions.map(icon => {
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                const IconComponent = (Icons as any)[icon];
                                return (
                                    <button
                                        key={icon}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, iconName: icon })}
                                        className={`p-2 rounded-lg flex items-center justify-center border transition-all ${formData.iconName === icon
                                            ? 'bg-purple-600 border-purple-400'
                                            : 'bg-black/30 border-transparent hover:border-purple-500/30'
                                            }`}
                                    >
                                        {IconComponent && <IconComponent />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-2">Color</label>
                        <div className="flex flex-wrap gap-2">
                            {colorOptions.map(color => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, color })}
                                    className={`w-8 h-8 rounded-full border-2 transition-all ${color} ${formData.color === color
                                        ? 'border-white scale-110'
                                        : 'border-transparent hover:scale-105'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                        >
                            {epic ? 'Save Changes' : 'Create'}
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
