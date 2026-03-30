import { Search as SearchIcon, Filter } from 'lucide-react';
import { useState } from 'react';
import { Note, Tag } from '../lib/supabase';

interface SearchPageProps {
  notes: Note[];
  tags: Tag[];
  onSelectNote: (note: Note) => void;
}

export default function SearchPage({ notes, tags, onSelectNote }: SearchPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'alphabetical'>('recent');

  const filteredNotes = notes.filter((note) => {
    const matchesQuery =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesQuery;
  });

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      case 'oldest':
        return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
      case 'alphabetical':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Search Notes</h1>
        <p className="text-gray-600">Find your notes quickly and easily</p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title or content..."
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="recent">Most Recent</option>
            <option value="oldest">Oldest First</option>
            <option value="alphabetical">Alphabetical</option>
          </select>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter by Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag.id}
                onClick={() =>
                  setSelectedTags(
                    selectedTags.includes(tag.id)
                      ? selectedTags.filter((t) => t !== tag.id)
                      : [...selectedTags, tag.id]
                  )
                }
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                  selectedTags.includes(tag.id)
                    ? `${tag.color} border-current`
                    : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                }`}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-gray-600 font-medium">
            {sortedNotes.length} results found
          </p>
          {sortedNotes.length === 0 ? (
            <div className="text-center py-12">
              <SearchIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No notes found</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your search query</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {sortedNotes.map((note) => (
                <button
                  key={note.id}
                  onClick={() => onSelectNote(note)}
                  className="text-left p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all hover:shadow-md"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900 text-lg">{note.title || 'Untitled'}</h3>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                      {new Date(note.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{note.content.substring(0, 150)}...</p>
                  <div className="flex items-center gap-2">
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      {note.content.split(' ').length} words
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
