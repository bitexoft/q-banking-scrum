import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { StoryCard } from './StoryCard';

interface Story {
    id: string;
    title: string;
    status: 'todo' | 'in-progress' | 'done' | 'blocked';
    sp: number;
    epic: string;
    assignee?: string;
    details?: string;
}

interface Epic {
    id: string;
    name: string;
    iconName: string;
    color: string;
    total: number;
}

interface DraggableStoryCardProps {
    story: Story;
    onEdit: (story: Story) => void;
    onDelete: (id: string) => void;
    epics?: Epic[];
    isBlocked?: boolean;
}

export const DraggableStoryCard: React.FC<DraggableStoryCardProps> = ({
    story,
    onEdit,
    onDelete,
    epics = [],
    isBlocked = false
}) => {
    if (!story || !story.id) {
        console.error('DraggableStoryCard received invalid story:', story);
        return null;
    }

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: story.id });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition: transition || 'transform 200ms cubic-bezier(0.2, 0, 0, 1)',
        opacity: isDragging ? 0.3 : 1,
        cursor: isDragging ? 'grabbing' : 'grab',
        zIndex: isDragging ? 50 : 'auto',
    };


    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={isBlocked ? 'bg-gradient-to-br from-orange-900/20 to-red-900/20 rounded-lg p-0.5' : ''}
        >
            <StoryCard
                story={story}
                onEdit={onEdit}
                onDelete={onDelete}
                epics={epics}
            />
        </div>
    );
};
