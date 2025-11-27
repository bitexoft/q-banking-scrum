import React from 'react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ComponentType<{ className?: string }>;
    iconColor: string;
    borderColor: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, iconColor, borderColor }) => (
    <div className={`bg-white/10 backdrop-blur-sm rounded-lg p-4 border ${borderColor}`}>
        <div className="flex items-center justify-between">
            <div>
                <div className="text-gray-400 text-sm">{title}</div>
                <div className="text-2xl font-bold mt-1">{value}</div>
            </div>
            <div className={iconColor}>
                <Icon />
            </div>
        </div>
    </div>
);
