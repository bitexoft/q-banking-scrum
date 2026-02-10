import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

interface DroppableColumnProps {
    id: string;
    title: string;
    icon: React.ReactNode;
    count: number;
    borderColor: string;
    children: React.ReactNode;
    items: string[];
}

export const DroppableColumn: React.FC<DroppableColumnProps> = ({
    id,
    title,
    icon,
    count,
    borderColor,
    children,
    items
}) => {
    const { setNodeRef, isOver } = useDroppable({ id });

    return (
        <div
            ref={setNodeRef}
            className={`bg-black/20 rounded-lg p-4 border ${borderColor} transition-all duration-300 min-h-[500px] flex flex-col ${isOver ? 'ring-2 ring-purple-500 bg-purple-500/20 border-purple-500/50 scale-[1.02] shadow-[0_0_30px_rgba(168,85,247,0.25)]' : ''
                }`}
        >
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                {icon}
                <span>{title}</span>
                <span className="text-sm font-normal text-gray-400">
                    ({count})
                </span>
            </h3>
            <SortableContext items={items} strategy={verticalListSortingStrategy}>
                <div className="space-y-3 flex-1">
                    {children}
                    {/* Add an empty div that expands to fill space, making the entire column droppable */}
                    {items.length === 0 && (
                        <div className="flex-1 min-h-[100px]" />
                    )}
                </div>
            </SortableContext>
        </div>
    );
};
