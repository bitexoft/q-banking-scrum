import { useState, useEffect, useMemo } from 'react';
import { DndContext, closestCorners, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { CircleIcon, PlayIcon, CheckIcon, TrendingIcon, ZapIcon, CalendarIcon, BlockedIcon, ChevronIcon } from './components/Icons';
import { StatCard } from './components/StatCard';
import { EpicCard } from './components/EpicCard';
import { SprintSelector } from './components/SprintSelector';
import { DraggableStoryCard } from './components/DraggableStoryCard';
import { DroppableColumn } from './components/DroppableColumn';
import { StoryCard } from './components/StoryCard';
import { StoryModal } from './components/StoryModal';
import { EpicModal } from './components/EpicModal';
import { SprintModal } from './components/SprintModal';
import { Login } from './components/Login';
import './App.css';
import { FcProcess } from "react-icons/fc";

interface Story {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'done' | 'blocked';
  sp: number;
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

interface Assignee {
  id: string;
  name: string;
}

interface Sprint {
  id: string;
  name: string;
  weeks: string;
  stories: Story[];
  status?: 'active' | 'planned' | 'completed';
}

interface ProjectData {
  sprints: Sprint[];
  epics: Epic[];
  assignees: Assignee[];
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [projectData, setProjectData] = useState<ProjectData>({ sprints: [], epics: [], assignees: [] });
  const [selectedSprint, setSelectedSprint] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEpicModalOpen, setIsEpicModalOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [editingEpic, setEditingEpic] = useState<Epic | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEpicsExpanded, setIsEpicsExpanded] = useState(false);
  const [isSprintModalOpen, setIsSprintModalOpen] = useState(false);
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Load data only when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const handleLogin = (success: boolean) => {
    if (success) {
      setIsAuthenticated(true);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/sprints`);
      const sprints = await response.json();

      const epicsResponse = await fetch(`${import.meta.env.VITE_API_URL}/epics`);
      const epics = await epicsResponse.json();

      const assigneesResponse = await fetch(`${import.meta.env.VITE_API_URL}/assignees`);
      const assignees = await assigneesResponse.json();

      setProjectData({ sprints, epics, assignees });
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error loading data. Make sure the API server is running.');
    } finally {
      setLoading(false);
    }
  };

  const currentSprint = projectData.sprints[selectedSprint] || { stories: [], name: 'Loading...', weeks: '' };

  // Calculate stats
  const stats = useMemo(() => {
    const allStories = projectData.sprints.flatMap(s => s.stories || []);
    const done = allStories.filter(s => s.status === 'done').length;
    const inProgress = allStories.filter(s => s.status === 'in-progress').length;
    const todo = allStories.filter(s => s.status === 'todo').length;
    const blocked = allStories.filter(s => s.status === 'blocked').length;
    const totalSP = allStories.reduce((sum, s) => sum + s.sp, 0);
    const completedSP = allStories.filter(s => s.status === 'done').reduce((sum, s) => sum + s.sp, 0);

    return { done, inProgress, todo, blocked, totalSP, completedSP, total: allStories.length };
  }, [projectData]);

  // Calculate stats for the current sprint
  const currentSprintStats = useMemo(() => {
    if (!currentSprint || !currentSprint.stories) return { total: 0, completed: 0 };
    const total = currentSprint.stories.reduce((sum, s) => sum + s.sp, 0);
    const completed = currentSprint.stories
      .filter(s => s.status === 'done')
      .reduce((sum, s) => sum + s.sp, 0);
    return { total, completed };
  }, [currentSprint]);

  // Calculate epic totals dynamically from stories
  const epicsWithTotals = useMemo(() => {
    const allStories = projectData.sprints.flatMap(s => s.stories || []);

    return projectData.epics.map(epic => {
      const epicStories = allStories.filter(story => story.epic === epic.name);
      const total = epicStories.reduce((sum, story) => sum + story.sp, 0);

      return {
        ...epic,
        total
      };
    });
  }, [projectData]);

  const filteredStories = useMemo(() => {
    if (!currentSprint || !currentSprint.stories) return [];
    return currentSprint.stories;
  }, [currentSprint]);

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || currentSprint.id === 'backlog') return;

    const storyId = active.id as string;
    const columnId = over.id as string;

    // Map column IDs to status values
    let newStatus: Story['status'];
    if (columnId === 'todo') {
      newStatus = 'todo';
    } else if (columnId === 'in-progress') {
      newStatus = 'in-progress';
    } else if (columnId === 'done') {
      newStatus = 'done';
    } else if (columnId === 'blocked') {
      newStatus = 'blocked';
    } else {
      return; // Invalid drop target
    }

    const story = projectData.sprints
      .flatMap(s => s.stories)
      .find(s => s.id === storyId);

    if (!story || story.status === newStatus) return;

    const sourceSprint = projectData.sprints.find(s => s.stories.some(st => st.id === storyId));
    if (!sourceSprint) return;

    // Optimistic update
    const updatedStories = sourceSprint.stories.map(s =>
      s.id === storyId ? { ...s, status: newStatus } : s
    );

    setProjectData(prev => ({
      ...prev,
      sprints: prev.sprints.map(s =>
        s.id === sourceSprint.id ? { ...s, stories: updatedStories } : s
      )
    }));

    // Persist to backend
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/sprints/${sourceSprint.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stories: updatedStories })
      });
    } catch (error) {
      console.error('Error updating story status:', error);
      loadData(); // Revert on error
    }
  };

  const handleSaveStory = async (storyData: Partial<Story>, targetSprintId: string) => {
    try {
      if (editingStory) {
        // Find which sprint the story CURRENTLY belongs to
        const sourceSprint = projectData.sprints.find(s =>
          s.stories.some(st => st.id === editingStory.id)
        );

        if (!sourceSprint) return;

        if (sourceSprint.id === targetSprintId) {
          // Edit same sprint
          const updatedStories = sourceSprint.stories.map(s =>
            s.id === editingStory.id ? { ...s, ...storyData } : s
          );

          // Optimistic update
          setProjectData(prev => ({
            ...prev,
            sprints: prev.sprints.map(s =>
              s.id === sourceSprint.id ? { ...s, stories: updatedStories } : s
            )
          }));

          // Persist to backend
          await fetch(`${import.meta.env.VITE_API_URL}/sprints/${sourceSprint.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stories: updatedStories })
          });
        } else {
          // Move between sprints
          const updatedSourceStories = sourceSprint.stories.filter(s => s.id !== editingStory.id);
          const targetSprint = projectData.sprints.find(s => s.id === targetSprintId);

          if (!targetSprint) return;

          const movedStory = {
            ...editingStory,
            ...storyData,
            status: targetSprintId === 'backlog' ? 'todo' : (storyData.status || (editingStory as Story).status)
          };
          const updatedTargetStories = [...(targetSprint.stories || []), movedStory];

          // Optimistic update
          setProjectData(prev => ({
            ...prev,
            sprints: prev.sprints.map(s => {
              if (s.id === sourceSprint.id) return { ...s, stories: updatedSourceStories };
              if (s.id === targetSprintId) return { ...s, stories: updatedTargetStories };
              return s;
            })
          }));

          // Persist to backend (both sprints sequentially to avoid json-server write lock issues)
          await fetch(`${import.meta.env.VITE_API_URL}/sprints/${sourceSprint.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stories: updatedSourceStories })
          });

          await fetch(`${import.meta.env.VITE_API_URL}/sprints/${targetSprintId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stories: updatedTargetStories })
          });
        }
      } else {
        // Create new
        // Robustly determine the next story ID by scanning all existing stories
        const allExistingStories = projectData.sprints.flatMap(s => s.stories || []);
        const storyIds = allExistingStories
          .map(s => {
            const match = s.id.match(/QB-(\d+)/);
            return match ? parseInt(match[1], 10) : 0;
          })
          .filter(id => !isNaN(id));

        const maxId = storyIds.length > 0 ? Math.max(...storyIds) : 0;
        const newId = maxId + 1;

        const newStory = {
          ...storyData,
          id: `QB-${newId}`
        } as Story;

        const targetSprint = projectData.sprints.find(s => s.id === targetSprintId);
        if (!targetSprint) return;

        const updatedTargetStories = [...(targetSprint.stories || []), newStory];

        // Persist story to backend
        await fetch(`${import.meta.env.VITE_API_URL}/sprints/${targetSprintId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stories: updatedTargetStories })
        });

        // Update counter
        await fetch(`${import.meta.env.VITE_API_URL}/settings`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lastStoryId: newId })
        });

        // Optimistic update
        setProjectData(prev => ({
          ...prev,
          sprints: prev.sprints.map(s =>
            s.id === targetSprintId ? { ...s, stories: updatedTargetStories } : s
          )
        }));
      }

      setIsModalOpen(false);
      setEditingStory(null);
    } catch (error) {
      console.error('Error saving story:', error);
      await loadData(); // Revert on error
    }
  };

  const handleSaveEpic = async (epicData: Partial<Epic>) => {
    try {
      let newEpic: Epic;
      if (editingEpic) {
        // Update existing
        newEpic = { ...editingEpic, ...epicData } as Epic;

        setProjectData(prev => ({
          ...prev,
          epics: prev.epics.map(e => e.id === editingEpic.id ? newEpic : e)
        }));

        await fetch(`${import.meta.env.VITE_API_URL}/epics/${editingEpic.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newEpic)
        });
      } else {
        // Create new
        newEpic = {
          id: `epic-${Date.now()}`,
          ...epicData
        } as Epic;

        setProjectData(prev => ({
          ...prev,
          epics: [...prev.epics, newEpic]
        }));

        await fetch(`${import.meta.env.VITE_API_URL}/epics`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newEpic)
        });
      }

      setIsEpicModalOpen(false);
      setEditingEpic(null);
    } catch (error) {
      console.error('Error saving epic:', error);
      loadData(); // Revert on error
    }
  };

  const handleEditEpic = (epic: Epic) => {
    setEditingEpic(epic);
    setIsEpicModalOpen(true);
  };

  const handleDeleteEpic = async (epic: Epic) => {
    // Check if used
    const isUsed = projectData.sprints.some(sprint =>
      sprint.stories && sprint.stories.some(story => story.epic === epic.id)
    );

    if (isUsed) {
      alert(`Cannot delete epic "${epic.name}" because it is assigned to stories.`);
      return;
    }

    if (!window.confirm(`Are you sure you want to delete epic "${epic.name}"?`)) {
      return;
    }

    try {
      // Optimistic update
      setProjectData(prev => ({
        ...prev,
        epics: prev.epics.filter(e => e.id !== epic.id)
      }));

      await fetch(`${import.meta.env.VITE_API_URL}/epics/${epic.id}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Error deleting epic:', error);
      loadData(); // Revert
    }
  };

  const handleActivateSprint = async (sprintId: string) => {
    try {
      // Deactivate all sprints and activate the target one
      const updatedSprints = projectData.sprints.map(s => ({
        ...s,
        status: (s.id === sprintId ? 'active' : 'planned') as Sprint['status']
      }));

      // Optimistic update
      setProjectData(prev => ({ ...prev, sprints: updatedSprints }));

      // Persist to backend - We need to update all sprints
      // In a real API we might have a single endpoint for this, 
      // but with json-server we have to do it individually or update the whole collection if supported
      await Promise.all(updatedSprints.map(sprint =>
        fetch(`${import.meta.env.VITE_API_URL}/sprints/${sprint.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: sprint.status })
        })
      ));
    } catch (error) {
      console.error('Error activating sprint:', error);
      loadData();
    }
  };

  const handleSaveSprint = async (sprintData: { name: string; weeks: string }) => {
    try {
      if (editingSprint) {
        // Edit existing sprint
        const updatedSprint = {
          ...editingSprint,
          name: sprintData.name,
          weeks: sprintData.weeks
        };

        // Update state
        setProjectData(prev => ({
          ...prev,
          sprints: prev.sprints.map(s => s.id === editingSprint.id ? updatedSprint : s)
        }));

        // Persist to backend
        await fetch(`${import.meta.env.VITE_API_URL}/sprints/${editingSprint.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: sprintData.name, weeks: sprintData.weeks })
        });
      } else {
        // Create new sprint
        const newSprint: Sprint = {
          id: `sprint-${Date.now()}`,
          name: sprintData.name,
          weeks: sprintData.weeks,
          stories: [],
          status: 'planned'
        };

        // Update state
        setProjectData(prev => ({
          ...prev,
          sprints: [...prev.sprints, newSprint]
        }));

        // Select the new sprint
        setSelectedSprint(projectData.sprints.length);

        // Persist to backend
        await fetch(`${import.meta.env.VITE_API_URL}/sprints`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newSprint)
        });
      }

      setIsSprintModalOpen(false);
      setEditingSprint(null);
    } catch (error) {
      console.error('Error saving sprint:', error);
      loadData();
    }
  };

  const handleDeleteSprint = async (sprint: Sprint) => {
    if (sprint.id === 'backlog') {
      alert('The Backlog cannot be deleted.');
      return;
    }

    if (sprint.stories.length > 0) {
      alert('Cannot delete a sprint that has assigned stories. Move the stories elsewhere first.');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete "${sprint.name}"?`)) {
      return;
    }

    try {
      // Optimistic update
      setProjectData(prev => ({
        ...prev,
        sprints: prev.sprints.filter(s => s.id !== sprint.id)
      }));

      // Adjust selected index if necessary
      const sprintIdx = projectData.sprints.findIndex(s => s.id === sprint.id);
      if (selectedSprint >= sprintIdx) {
        setSelectedSprint(Math.max(0, selectedSprint - 1));
      }

      // Persist to backend
      await fetch(`${import.meta.env.VITE_API_URL}/sprints/${sprint.id}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Error deleting sprint:', error);
      loadData();
    }
  };

  const handleEditSprint = (sprint: Sprint) => {
    setEditingSprint(sprint);
    setIsSprintModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingStory(null);
    setIsModalOpen(true);
  };

  const openEditModal = (story: Story) => {
    setEditingStory(story);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStory(null);
  };

  const handleDeleteStory = async (storyId: string) => {
    // Find owner sprint dynamically
    const ownerSprint = projectData.sprints.find(s => s.stories.some(st => st.id === storyId));
    if (!ownerSprint) return;

    const story = ownerSprint.stories.find(s => s.id === storyId);
    if (!story) return;

    if (!window.confirm(`Are you sure you want to delete story "${story.title}"?`)) {
      return;
    }

    try {
      // Optimistic update
      const updatedStories = ownerSprint.stories.filter(s => s.id !== storyId);

      setProjectData(prev => ({
        ...prev,
        sprints: prev.sprints.map(s =>
          s.id === ownerSprint.id ? { ...s, stories: updatedStories } : s
        )
      }));

      // Persist to backend
      await fetch(`${import.meta.env.VITE_API_URL}/sprints/${ownerSprint.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stories: updatedStories })
      });
    } catch (error) {
      console.error('Error deleting story:', error);
      loadData(); // Revert on error
    }
  };

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  // Show loading screen while fetching data
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-sm border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                <FcProcess /> Scrum of Quantum-Banking
              </h1>
              <p className="text-purple-300 mt-1">Banking manager</p>
            </div>
            <div className="flex gap-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-400">{stats.completedSP}/{stats.totalSP}</div>
                <div className="text-xs text-purple-300">Story Points</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-400">{stats.done}/{stats.total}</div>
                <div className="text-xs text-blue-300">Stories Done</div>
              </div>
            </div>
          </div>
        </div>
        {/* Subtle Progress Bar */}
        <div className="w-full bg-black/40 h-1.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 h-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(168,85,247,0.5)]"
            style={{ width: `${stats.totalSP > 0 ? (stats.completedSP / stats.totalSP) * 100 : 0}%` }}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <StatCard title="To Do" value={stats.todo} icon={CircleIcon} iconColor="text-gray-400" borderColor="border-purple-500/20" />
          <StatCard title="Blocked" value={stats.blocked} icon={BlockedIcon} iconColor="text-red-400" borderColor="border-red-500/20" />
          <StatCard title="In Progress" value={stats.inProgress} icon={PlayIcon} iconColor="text-blue-400" borderColor="border-blue-500/20" />
          <StatCard title="Completed" value={stats.done} icon={CheckIcon} iconColor="text-green-400" borderColor="border-green-500/20" />
          <StatCard title="Velocity" value="15-25 SP" icon={TrendingIcon} iconColor="text-purple-400" borderColor="border-purple-500/20" />
        </div>

        {/* Sprint Selector */}
        <SprintSelector
          sprints={projectData.sprints}
          selectedSprint={selectedSprint}
          onSelect={setSelectedSprint}
          onAddSprint={() => { setEditingSprint(null); setIsSprintModalOpen(true); }}
          onEditSprint={handleEditSprint}
          onDeleteSprint={handleDeleteSprint}
        />


        {/* Stories List */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden border border-purple-500/20">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <div className="text-purple-400">
                  <CalendarIcon />
                </div>
                {currentSprint.id === 'backlog' ? currentSprint.name : `${currentSprint.name} - User Stories`}
                {currentSprint.id !== 'backlog' && (
                  <span className="ml-3 px-2 py-0.5 bg-purple-500/10 text-purple-300 text-xs rounded-full border border-purple-500/20 font-mono">
                    {currentSprintStats.completed}/{currentSprintStats.total} SP
                  </span>
                )}
                {(currentSprint as Sprint).status === 'active' && (
                  <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30 animate-pulse">
                    ACTIVE
                  </span>
                )}
              </h2>
              <div className="flex gap-2">
                {(currentSprint as Sprint).status !== 'active' && currentSprint.id && currentSprint.id !== 'backlog' && (
                  <button
                    onClick={() => handleActivateSprint(currentSprint.id)}
                    className="px-3 py-1.5 bg-green-600/20 text-green-300 rounded-lg text-sm font-semibold hover:bg-green-600/40 transition-colors border border-green-500/30"
                  >
                    Set as Active
                  </button>
                )}
                <button
                  onClick={openCreateModal}
                  className="px-3 py-1.5 bg-purple-600/20 text-purple-300 rounded-lg text-sm font-semibold hover:bg-purple-600/40 transition-colors border border-purple-500/30"
                >
                  + Create Story
                </button>
              </div>
            </div>

            {/* Kanban Board or Backlog View */}
            <DndContext
              sensors={sensors}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              collisionDetection={closestCorners}
            >
              {currentSprint.id === 'backlog' ? (
                <div className="max-w-2xl mx-auto">
                  <DroppableColumn
                    id="todo"
                    title="User stories"
                    icon={<CircleIcon />}
                    count={filteredStories.length}
                    borderColor="border-purple-500/30"
                    items={filteredStories.map(s => s.id)}
                  >
                    {filteredStories.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 text-sm">
                        No stories in backlog
                      </div>
                    ) : (
                      filteredStories.map(story => (
                        <DraggableStoryCard
                          key={story.id}
                          story={{ ...story, status: 'todo' }}
                          epics={projectData.epics}
                          onEdit={openEditModal}
                          onDelete={handleDeleteStory}
                        />
                      ))
                    )}
                  </DroppableColumn>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* To Do Column */}
                  <DroppableColumn
                    id="todo"
                    title="To Do"
                    icon={<CircleIcon />}
                    count={filteredStories.filter(s => s.status === 'todo').length}
                    borderColor="border-purple-500/20"
                    items={filteredStories.filter(s => s.status === 'todo').map(s => s.id)}
                  >
                    {filteredStories.filter(s => s.status === 'todo').length === 0 ? (
                      <div className="text-center py-8 text-gray-500 text-sm">
                        No stories
                      </div>
                    ) : (
                      filteredStories
                        .filter(s => s.status === 'todo')
                        .map(story => (
                          <DraggableStoryCard
                            key={story.id}
                            story={story}
                            onEdit={openEditModal}
                            onDelete={handleDeleteStory}
                            epics={projectData.epics}
                          />
                        ))
                    )}
                  </DroppableColumn>

                  {/* In Progress Column */}
                  <DroppableColumn
                    id="in-progress"
                    title="In Progress"
                    icon={<PlayIcon />}
                    count={filteredStories.filter(s => s.status === 'in-progress' || s.status === 'blocked').length}
                    borderColor="border-blue-500/20"
                    items={filteredStories.filter(s => s.status === 'in-progress' || s.status === 'blocked').map(s => s.id)}
                  >
                    {filteredStories.filter(s => s.status === 'in-progress' || s.status === 'blocked').length === 0 ? (
                      <div className="text-center py-8 text-gray-500 text-sm">
                        No stories
                      </div>
                    ) : (
                      filteredStories
                        .filter(s => s.status === 'in-progress' || s.status === 'blocked')
                        .map(story => (
                          <DraggableStoryCard
                            key={story.id}
                            story={story}
                            onEdit={openEditModal}
                            onDelete={handleDeleteStory}
                            epics={projectData.epics}
                            isBlocked={story.status === 'blocked'}
                          />
                        ))
                    )}
                  </DroppableColumn>

                  {/* Completed Column */}
                  <DroppableColumn
                    id="done"
                    title="Completed"
                    icon={<CheckIcon />}
                    count={filteredStories.filter(s => s.status === 'done').length}
                    borderColor="border-green-500/20"
                    items={filteredStories.filter(s => s.status === 'done').map(s => s.id)}
                  >
                    {filteredStories.filter(s => s.status === 'done').length === 0 ? (
                      <div className="text-center py-8 text-gray-500 text-sm">
                        No stories
                      </div>
                    ) : (
                      filteredStories
                        .filter(s => s.status === 'done')
                        .map(story => (
                          <DraggableStoryCard
                            key={story.id}
                            story={story}
                            onEdit={openEditModal}
                            onDelete={handleDeleteStory}
                            epics={projectData.epics}
                          />
                        ))
                    )}
                  </DroppableColumn>
                </div>
              )}

              <DragOverlay adjustScale={true}>
                {activeId ? (
                  <div className="shadow-2xl opacity-90 scale-105 transition-transform">
                    {(() => {
                      const activeStory = projectData.sprints
                        .flatMap(s => s.stories)
                        .find(s => s.id === activeId);
                      return activeStory ? (
                        <div className="w-[350px]">
                          <StoryCard
                            story={activeStory}
                            epics={projectData.epics}
                            onEdit={() => { }}
                            onDelete={() => { }}
                          />
                        </div>
                      ) : null;
                    })()}
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>
        </div>

        {/* Epics Overview */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mt-8 border border-purple-500/20">
          <div className="flex items-center justify-between mb-0">
            <div
              className="flex items-center gap-2 cursor-pointer group"
              onClick={() => setIsEpicsExpanded(!isEpicsExpanded)}
            >
              <div className="text-yellow-400">
                <ZapIcon />
              </div>
              <h2 className="text-xl font-bold">Project Epics</h2>
              <div className={`transition-transform duration-300 ${isEpicsExpanded ? 'rotate-180' : ''} text-purple-400`}>
                <ChevronIcon />
              </div>
            </div>
            <button
              onClick={() => { setEditingEpic(null); setIsEpicModalOpen(true); }}
              className="px-3 py-1.5 bg-purple-600/20 text-purple-300 rounded-lg text-sm font-semibold hover:bg-purple-600/40 transition-colors border border-purple-500/30"
            >
              + Add Epic
            </button>
          </div>

          <div className={`grid transition-all duration-300 ease-in-out ${isEpicsExpanded ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0 overflow-hidden'}`}>
            <div className="overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {epicsWithTotals.map(epic => (
                  <EpicCard
                    key={epic.id}
                    epic={epic}
                    onEdit={handleEditEpic}
                    onDelete={handleDeleteEpic}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>By Bitexoft&copy; - 2026</p>
        </div>

        {/* Modals */}
        <StoryModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSave={handleSaveStory}
          story={editingStory}
          epics={projectData.epics}
          assignees={projectData.assignees}
          sprints={projectData.sprints}
          activeSprintId={projectData.sprints.find(s => s.status === 'active')?.id || currentSprint.id}
          currentSprintId={editingStory ? projectData.sprints.find(s => s.stories.some(st => st.id === editingStory.id))?.id : undefined}
        />

        <EpicModal
          isOpen={isEpicModalOpen}
          onClose={() => { setIsEpicModalOpen(false); setEditingEpic(null); }}
          onSave={handleSaveEpic}
          epic={editingEpic}
        />

        <SprintModal
          isOpen={isSprintModalOpen}
          onClose={() => { setIsSprintModalOpen(false); setEditingSprint(null); }}
          onSave={handleSaveSprint}
          sprint={editingSprint}
        />
      </div>
    </div>
  );
}

export default App;