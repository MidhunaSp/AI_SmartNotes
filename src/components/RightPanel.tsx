import { useState } from 'react';
import { Search, Share2, Plus } from 'lucide-react';
import { Note } from '../lib/supabase';

interface RightPanelProps {
  notes: Note[];
  onSelectNote: (note: Note) => void;
  onCreateNote: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function RightPanel({
  notes,
  onSelectNote,
  onCreateNote,
  searchQuery,
  onSearchChange,
}: RightPanelProps) {
  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-80 bg-white p-6 flex flex-col gap-4 border-l border-gray-200">
      <button
        onClick={onCreateNote}
        className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" />
        New Note
      </button>

      <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
        <Share2 className="w-5 h-5" />
        Share
      </button>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search notes"
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">All Notes</h3>
        <div className="space-y-2">
          {filteredNotes.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No notes found</p>
          ) : (
            filteredNotes.map((note) => (
              <button
                key={note.id}
                onClick={() => onSelectNote(note)}
                className="w-full text-left p-3 rounded-lg hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-200"
              >
                <p className="text-sm font-medium text-gray-900 truncate">{note.title || 'Untitled'}</p>
                <p className="text-xs text-gray-500 truncate mt-1">{note.content.substring(0, 50)}...</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(note.created_at).toLocaleDateString()}</p>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
