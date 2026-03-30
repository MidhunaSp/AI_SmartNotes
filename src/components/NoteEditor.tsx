import { useState } from 'react';
import { Bold, Italic, Underline, List, ListOrdered, Indent, Wand2 } from 'lucide-react';
import { generateSummaryLocal } from '../lib/aiSummary';
import { Note, Tag } from '../lib/supabase';

interface NoteEditorProps {
  note: Note | null;
  tags: Tag[];
  noteTags: string[];
  onSave?: (title: string, content: string) => void;
}

const toolbarButtons = [
  { icon: Bold, label: 'Bold' },
  { icon: Italic, label: 'Italic' },
  { icon: Underline, label: 'Underline' },
  { icon: List, label: 'Bullet List' },
  { icon: ListOrdered, label: 'Numbered List' },
  { icon: Indent, label: 'Indent' },
];

export default function NoteEditor({ note, tags, noteTags, onSave }: NoteEditorProps) {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [summary, setSummary] = useState('');
  const [generateingSummary, setGeneratingSummary] = useState(false);

  const handleGenerateSummary = async () => {
    if (!content.trim()) return;
    setGeneratingSummary(true);
    try {
      const result = await generateSummaryLocal(content);
      setSummary(result);
    } catch (error) {
      console.error('Failed to generate summary:', error);
    } finally {
      setGeneratingSummary(false);
    }
  };

  const noteTagObjects = tags.filter((tag) => noteTags.includes(tag.id));

  if (!note) {
    return (
      <div className="flex-1 bg-white rounded-xl shadow-lg p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg">No note selected</p>
          <p className="text-gray-400 text-sm mt-2">Select a note or create a new one to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white rounded-xl shadow-lg p-8 flex flex-col overflow-y-auto">
      <div className="mb-6">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-3xl font-bold text-gray-900 mb-2 w-full bg-transparent border-b-2 border-transparent hover:border-blue-200 focus:outline-none focus:border-blue-500 transition-all"
          placeholder="Note title"
        />
        <p className="text-sm text-gray-500">Last edited: {new Date(note.updated_at).toLocaleDateString()}</p>
        {noteTagObjects.length > 0 && (
          <div className="flex gap-2 mt-3">
            {noteTagObjects.map((tag) => (
              <span key={tag.id} className={`px-3 py-1 rounded-full text-xs font-medium ${tag.color}`}>
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mb-6 flex gap-2 pb-4 border-b border-gray-200">
        {toolbarButtons.map((button) => {
          const Icon = button.icon;
          return (
            <button
              key={button.label}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title={button.label}
            >
              <Icon className="w-5 h-5 text-gray-600" />
            </button>
          );
        })}
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="flex-1 w-full bg-white border border-gray-200 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        placeholder="Start typing your note..."
      />

      <div className="mt-6 flex gap-3">
        {onSave && (
          <button
            onClick={() => onSave(title, content)}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all font-medium"
          >
            Save Note
          </button>
        )}
        <button
          onClick={handleGenerateSummary}
          disabled={generateingSummary || !content.trim()}
          className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all font-medium flex items-center gap-2 disabled:opacity-50"
        >
          <Wand2 className="w-4 h-4" />
          {generateingSummary ? 'Generating...' : 'Generate Summary'}
        </button>
      </div>

      {summary && (
        <div className="mt-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 16c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7z" fill="currentColor"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">AI Summary</h3>
          </div>
          <p className="text-gray-700 leading-relaxed">{summary}</p>
        </div>
      )}
    </div>
  );
}
