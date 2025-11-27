export const StoriesList = ({ stories, filter, onStoryClick, onStoryEdit, onCreate, sprintName, loading }) => {
  // ... same code
  
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden border border-purple-500/20">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          {/* ... same title code */}
          <button
            onClick={onCreate}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            + Crear Historia
          </button>
        </div>
        
        {/* Show loading state */}
        {loading ? (
          <div className="text-center py-8 text-gray-400">Guardando...</div>
        ) : (
          <div className="space-y-3">
            {filteredStories.map(story => (
              <StoryCard 
                key={story.id} 
                story={story} 
                onClick={onStoryClick}
                onEdit={onStoryEdit}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};