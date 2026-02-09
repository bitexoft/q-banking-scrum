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
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        cursor: 'grab',
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
