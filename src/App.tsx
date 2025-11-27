import { useState, useEffect, useMemo } from 'react';
import { CircleIcon, PlayIcon, CheckIcon, TrendingIcon, ZapIcon, CalendarIcon, BlockedIcon } from './components/Icons';
import { StatCard } from './components/StatCard';
import { EpicCard } from './components/EpicCard';
import { SprintSelector } from './components/SprintSelector';
import { EpicFilter } from './components/EpicFilter';
import { StoryCard } from './components/StoryCard';
import { StoryModal } from './components/StoryModal';
import { EpicModal } from './components/EpicModal';
import { Login } from './components/Login';
import './App.css';
import { FcProcess } from "react-icons/fc";

interface Story {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'done' | 'blocked';
  sp: number;
  priority: string;
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
  const [filter, setFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEpicModalOpen, setIsEpicModalOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [editingEpic, setEditingEpic] = useState<Epic | null>(null);
  const [loading, setLoading] = useState(true);

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
      const response = await fetch('http://localhost:3001/sprints');
      const sprints = await response.json();

      const epicsResponse = await fetch('http://localhost:3001/epics');
      const epics = await epicsResponse.json();

      const assigneesResponse = await fetch('http://localhost:3001/assignees');
      const assignees = await assigneesResponse.json();

      setProjectData({ sprints, epics, assignees });
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error loading data. Make sure json-server is running on port 3001');
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
    if (!currentSprint.stories) return [];
    if (filter === 'all') return currentSprint.stories;
    return currentSprint.stories.filter(s => s.epic === filter);
  }, [currentSprint, filter]);

  const toggleStoryStatus = async (storyId: string) => {
    const story = currentSprint.stories.find(s => s.id === storyId);
    if (!story) return;

    const statusFlow: Record<Story['status'], Story['status']> = { 'todo': 'in-progress', 'in-progress': 'done', 'done': 'blocked', 'blocked': 'todo' };
    const newStatus = statusFlow[story.status];

    // Optimistic update
    const updatedStories = currentSprint.stories.map(s =>
      s.id === storyId ? { ...s, status: newStatus } : s
    );

    setProjectData(prev => ({
      ...prev,
      sprints: prev.sprints.map(s =>
        s.id === currentSprint.id ? { ...s, stories: updatedStories } : s
      )
    }));

    // Persist to backend
    try {
      await fetch(`http://localhost:3001/sprints/${currentSprint.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stories: updatedStories })
      });
    } catch (error) {
      console.error('Error updating story:', error);
      loadData(); // Revert on error
    }
  };

  const handleSaveStory = async (storyData: Partial<Story>) => {
    try {
      let updatedStories: Story[];

      if (editingStory) {
        // Edit existing
        updatedStories = currentSprint.stories.map(s =>
          s.id === editingStory.id ? { ...s, ...storyData } : s
        );

        // Optimistic update
        setProjectData(prev => ({
          ...prev,
          sprints: prev.sprints.map(s =>
            s.id === currentSprint.id ? { ...s, stories: updatedStories } : s
          )
        }));

        // Persist to backend
        await fetch(`http://localhost:3001/sprints/${currentSprint.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stories: updatedStories })
        });
      } else {
        // Create new - Generate auto-incremental ID
        // Fetch current counter
        const counterResponse = await fetch('http://localhost:3001/lastStoryId');
        const currentId = await counterResponse.json();
        const newId = currentId + 1;

        // Create new story with auto-generated ID
        const newStory = {
          ...storyData,
          id: `SPK-${newId}`
        } as Story;
        updatedStories = [...currentSprint.stories, newStory];

        // Persist story to backend first
        await fetch(`http://localhost:3001/sprints/${currentSprint.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stories: updatedStories })
        });

        // Update counter in db.json using PATCH on the root
        await fetch('http://localhost:3001/db', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lastStoryId: newId })
        });

        // Optimistic update after successful backend operations
        setProjectData(prev => ({
          ...prev,
          sprints: prev.sprints.map(s =>
            s.id === currentSprint.id ? { ...s, stories: updatedStories } : s
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

        await fetch(`http://localhost:3001/epics/${editingEpic.id}`, {
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

        await fetch('http://localhost:3001/epics', {
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

      await fetch(`http://localhost:3001/epics/${epic.id}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Error deleting epic:', error);
      loadData(); // Revert
    }
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
    const story = currentSprint.stories.find(s => s.id === storyId);
    if (!story) return;

    if (!window.confirm(`Are you sure you want to delete story "${story.title}"?`)) {
      return;
    }

    try {
      // Optimistic update
      const updatedStories = currentSprint.stories.filter(s => s.id !== storyId);

      setProjectData(prev => ({
        ...prev,
        sprints: prev.sprints.map(s =>
          s.id === currentSprint.id ? { ...s, stories: updatedStories } : s
        )
      }));

      // Persist to backend
      await fetch(`http://localhost:3001/sprints/${currentSprint.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stories: updatedStories })
      });
    } catch (error) {
      console.error('Error deleting story:', error);
      loadData(); // Revert on error
    }
  };

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
                <FcProcess /> Scrum of Bitexoft
              </h1>
              <p className="text-purple-300 mt-1">AI Agency (consulting + training)</p>
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
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <StatCard title="To Do" value={stats.todo} icon={CircleIcon} iconColor="text-gray-400" borderColor="border-purple-500/20" />
          <StatCard title="In Progress" value={stats.inProgress} icon={PlayIcon} iconColor="text-blue-400" borderColor="border-blue-500/20" />
          <StatCard title="Completed" value={stats.done} icon={CheckIcon} iconColor="text-green-400" borderColor="border-green-500/20" />
          <StatCard title="Blocked" value={stats.blocked} icon={BlockedIcon} iconColor="text-red-400" borderColor="border-red-500/20" />
          <StatCard title="Velocity" value="15-25 SP" icon={TrendingIcon} iconColor="text-purple-400" borderColor="border-purple-500/20" />
        </div>

        {/* Epics Overview */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-8 border border-purple-500/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <div className="text-yellow-400">
                <ZapIcon />
              </div>
              Project Epics
            </h2>
            <button
              onClick={() => { setEditingEpic(null); setIsEpicModalOpen(true); }}
              className="px-3 py-1.5 bg-purple-600/20 text-purple-300 rounded-lg text-sm font-semibold hover:bg-purple-600/40 transition-colors border border-purple-500/30"
            >
              + Add Epic
            </button>
          </div>
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

        {/* Sprint Selector */}
        <SprintSelector
          sprints={projectData.sprints}
          selectedSprint={selectedSprint}
          onSelect={setSelectedSprint}
        />

        {/* Filter by Epic */}
        {/* Filter by Epic */}
        <EpicFilter filter={filter} onFilterChange={setFilter} epics={projectData.epics} />

        {/* Stories List */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden border border-purple-500/20">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <div className="text-purple-400">
                  <CalendarIcon />
                </div>
                {currentSprint.name} - User Stories
              </h2>
              <button
                onClick={openCreateModal}
                className="px-3 py-1.5 bg-purple-600/20 text-purple-300 rounded-lg text-sm font-semibold hover:bg-purple-600/40 transition-colors border border-purple-500/30"
              >
                + Create Story
              </button>
            </div>

            <div className="space-y-3">
              {filteredStories.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  No stories in this sprint
                </div>
              ) : (
                filteredStories.map(story => (
                  <StoryCard
                    key={story.id}
                    story={story}
                    onClick={toggleStoryStatus}
                    onEdit={openEditModal}
                    onDelete={handleDeleteStory}
                    epics={projectData.epics}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-purple-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">Overall Project Progress</span>
            <span className="text-sm text-purple-400">
              {stats.totalSP > 0 ? Math.round((stats.completedSP / stats.totalSP) * 100) : 0}%
            </span>
          </div>
          <div className="w-full bg-black/30 rounded-full h-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-500 rounded-full"
              style={{ width: `${stats.totalSP > 0 ? (stats.completedSP / stats.totalSP) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>Click on status icons to change: To Do → In Progress → Done → Blocked → To Do</p>
        </div>

        {/* Modals */}
        <StoryModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSave={handleSaveStory}
          story={editingStory}
          epics={projectData.epics}
          assignees={projectData.assignees}
        />

        <EpicModal
          isOpen={isEpicModalOpen}
          onClose={() => { setIsEpicModalOpen(false); setEditingEpic(null); }}
          onSave={handleSaveEpic}
          epic={editingEpic}
        />
      </div>
    </div>
  );
}

export default App;