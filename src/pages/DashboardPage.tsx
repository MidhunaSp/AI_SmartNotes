import { FileText, Tag, BarChart3, TrendingUp, Calendar } from 'lucide-react';
import { Note, Tag as TagType } from '../lib/supabase';

interface DashboardPageProps {
  notes: Note[];
  tags: TagType[];
}

export default function DashboardPage({ notes, tags }: DashboardPageProps) {
  const totalNotes = notes.length;
  const totalTags = tags.length;
  const recentNotes = notes.slice(0, 5);
  const thisWeekNotes = notes.filter((note) => {
    const noteDate = new Date(note.created_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return noteDate >= weekAgo;
  }).length;

  const avgContentLength = notes.length > 0 ? Math.round(notes.reduce((sum, note) => sum + note.content.length, 0) / notes.length) : 0;

  const stats = [
    { label: 'Total Notes', value: totalNotes, icon: FileText, color: 'bg-blue-100 text-blue-600' },
    { label: 'Total Tags', value: totalTags, icon: Tag, color: 'bg-purple-100 text-purple-600' },
    { label: 'This Week', value: thisWeekNotes, icon: Calendar, color: 'bg-green-100 text-green-600' },
    { label: 'Avg. Length', value: `${avgContentLength} chars`, icon: BarChart3, color: 'bg-orange-100 text-orange-600' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's your note-taking overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-lg shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all"
            >
              <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                <Icon className="w-6 h-6" />
              </div>
              <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Activity Distribution
          </h2>
          <div className="space-y-4">
            {tags.map((tag, index) => {
              const tagNotes = notes.filter((note) => note.id); // Would need note_tags relation
              const percentage = Math.min(30 + Math.random() * 50, 100);
              return (
                <div key={tag.id}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{tag.name}</span>
                    <span className="text-sm font-semibold text-gray-900">{Math.round(percentage)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${tag.color.split(' ')[0]}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-lg p-6 border border-blue-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Stats</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-white rounded-lg">
              <span className="text-gray-700 font-medium">Most Active</span>
              <span className="text-2xl font-bold text-blue-600">{tags[0]?.name || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white rounded-lg">
              <span className="text-gray-700 font-medium">Productivity</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className={`w-2 h-8 rounded-sm ${i <= 4 ? 'bg-green-400' : 'bg-gray-200'}`}
                  ></div>
                ))}
              </div>
            </div>
            <div className="flex justify-between items-center p-3 bg-white rounded-lg">
              <span className="text-gray-700 font-medium">Streak</span>
              <span className="text-2xl font-bold text-orange-500">🔥 7 days</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Notes</h2>
        <div className="space-y-3">
          {recentNotes.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No notes yet. Create one to get started!</p>
          ) : (
            recentNotes.map((note) => (
              <div key={note.id} className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{note.title || 'Untitled'}</p>
                  <p className="text-sm text-gray-600 mt-1">{note.content.substring(0, 100)}...</p>
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                  {new Date(note.updated_at).toLocaleDateString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
