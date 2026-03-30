import { Tag, Edit2, Trash2, Plus } from 'lucide-react';
import { useState } from 'react';
import { supabase, Tag as TagType } from '../lib/supabase';

interface TagsPageProps {
  tags: TagType[];
  onRefresh: () => void;
}

export default function TagsPage({ tags, onRefresh }: TagsPageProps) {
  const [showAddTag, setShowAddTag] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleAddTag = async () => {
    if (!newTagName.trim()) return;

    try {
      const { error } = await supabase.from('tags').insert({
        name: newTagName,
        color: 'bg-gray-100 text-gray-700 border-gray-200',
        user_id: (await supabase.auth.getUser()).data.user?.id,
      });

      if (error) throw error;
      setNewTagName('');
      setShowAddTag(false);
      onRefresh();
    } catch (error) {
      console.error('Error adding tag:', error);
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    try {
      const { error } = await supabase.from('tags').delete().eq('id', tagId);
      if (error) throw error;
      onRefresh();
    } catch (error) {
      console.error('Error deleting tag:', error);
    }
  };

  const handleUpdateTag = async (tagId: string) => {
    if (!editingName.trim()) return;

    try {
      const { error } = await supabase
        .from('tags')
        .update({ name: editingName })
        .eq('id', tagId);

      if (error) throw error;
      setEditingTag(null);
      setEditingName('');
      onRefresh();
    } catch (error) {
      console.error('Error updating tag:', error);
    }
  };

  const colorOptions = [
    'bg-purple-100 text-purple-700 border-purple-200',
    'bg-green-100 text-green-700 border-green-200',
    'bg-yellow-100 text-yellow-700 border-yellow-200',
    'bg-red-100 text-red-700 border-red-200',
    'bg-blue-100 text-blue-700 border-blue-200',
    'bg-indigo-100 text-indigo-700 border-indigo-200',
    'bg-pink-100 text-pink-700 border-pink-200',
    'bg-teal-100 text-teal-700 border-teal-200',
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Tags</h1>
          <p className="text-gray-600">Organize and manage your note tags</p>
        </div>
        <button
          onClick={() => setShowAddTag(true)}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Tag
        </button>
      </div>

      {showAddTag && (
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Create New Tag</h2>
          <div className="flex gap-3">
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="Tag name..."
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
            />
            <button
              onClick={handleAddTag}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all font-medium"
            >
              Create
            </button>
            <button
              onClick={() => setShowAddTag(false)}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tags.map((tag) => (
          <div key={tag.id} className="bg-white rounded-lg shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className={`px-3 py-1 rounded-full text-sm font-semibold ${tag.color}`}>
                {tag.name}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingTag(tag.id);
                    setEditingName(tag.name);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-all text-gray-600"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteTag(tag.id)}
                  className="p-2 hover:bg-red-100 rounded-lg transition-all text-red-600"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {editingTag === tag.id ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => handleUpdateTag(tag.id)}
                  className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-all"
                >
                  Save
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-600">Created on {new Date(tag.created_at).toLocaleDateString()}</p>
            )}
          </div>
        ))}
      </div>

      {tags.length === 0 && !showAddTag && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No tags yet</p>
          <p className="text-gray-400 text-sm mt-1">Create your first tag to organize notes</p>
        </div>
      )}
    </div>
  );
}
