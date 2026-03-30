import React from 'react';
import { Calendar, LineChart, Users, BarChart3, PieChart, Tag as TagIcon } from 'lucide-react';
import { Note, Tag } from '../lib/supabase';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement
} from 'chart.js';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement
);

interface InsightsPageProps {
  notes: Note[];
  tags: Tag[];
  noteTags: Map<string, string[]>;
}

export default function InsightsPage({ notes, tags, noteTags }: InsightsPageProps) {
  // --- Metrics ---
  const avgWordsPerNote = notes.length > 0
    ? Math.round(notes.reduce((sum, n) => sum + n.content.split(/\s+/).length, 0) / notes.length)
    : 0;

  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const notesByDay: Record<string, number> = {};
  days.forEach(d => notesByDay[d] = 0);
  notes.forEach(n => {
    const day = days[new Date(n.created_at).getDay()];
    notesByDay[day]++;
  });
  const mostActiveDay = Object.entries(notesByDay).sort((a,b)=>b[1]-a[1])[0]?.[0] || '-';

  const untaggedNotes = notes.filter(n => !(noteTags.get(n.id)?.length)).length;

  // --- Notes by Tag (show all tags) ---
  const notesByTagCount: Record<string, number> = {};
  tags.forEach(tag => notesByTagCount[tag.name] = 0);

  // Count notes per tag
  notes.forEach(note => {
    const tagsForNote = noteTags.get(note.id) || [];
    tagsForNote.forEach(tagId => {
      const tag = tags.find(t => t.id === tagId);
      if (tag) notesByTagCount[tag.name]++;
    });
  });

  // Ensure minimum count of 1 for tags you want to show even if 0
  tags.forEach(tag => {
    if (!(notesByTagCount[tag.name] > 0)) {
      notesByTagCount[tag.name] = 1; // set minimum 1
    }
  });

  const sortedTags = Object.entries(notesByTagCount).sort((a,b) => b[1]-a[1]);
  const tagLabels = sortedTags.map(([tag]) => tag);
  const tagCounts = sortedTags.map(([_, count]) => count);

  // --- Colors ---
  const colorPalette = [
    '#3b82f6','#10b981','#f59e0b','#f43f5e','#8b5cf6','#ec4899','#22d3ee',
    '#f87171','#fbbf24','#34d399','#60a5fa','#a78bfa','#f472b6','#fcd34d','#4ade80','#38bdf8','#e879f9','#fcd34d','#22c55e'
  ];

  // --- Pie Chart ---
  const pieData = {
    labels: tagLabels,
    datasets: [
      {
        label: 'Notes by Tag',
        data: tagCounts,
        backgroundColor: tagLabels.map((_, idx) => colorPalette[idx % colorPalette.length]),
        borderColor: '#fff',
        borderWidth: 2,
      }
    ]
  };

  // --- Bar Chart ---
  const barData = {
    labels: tagLabels,
    datasets: [
      {
        label: 'Tag Usage',
        data: tagCounts,
        backgroundColor: tagLabels.map((_, idx) => colorPalette[idx % colorPalette.length]),
      }
    ]
  };

  // --- Insights Cards ---
  const generalInsights = [
    { label: 'Most Active Day', value: mostActiveDay, icon: Calendar, color: 'bg-yellow-100 text-yellow-600' },
    { label: 'Avg Note Length', value: avgWordsPerNote, icon: LineChart, color: 'bg-purple-100 text-purple-600' },
    { label: 'Untagged Notes', value: untaggedNotes, icon: Users, color: 'bg-red-100 text-red-600' },
  ];

  // Dynamic insights for all tags
  const tagInsights = sortedTags.map(([tag, count], idx) => ({
    label: `${tag} Notes`,
    value: count,
    icon: TagIcon,
    color: `bg-[${colorPalette[idx % colorPalette.length]}] text-white`
  }));

  const allInsights = [...generalInsights, ...tagInsights];

  return (
    <div className="bg-white min-h-screen p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Insights</h1>
        <p className="text-gray-600">Analyze your note-taking patterns and tag usage</p>
      </div>

      {/* Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {allInsights.map(insight => {
          const Icon = insight.icon;
          return (
            <div key={insight.label} className="bg-white rounded-lg shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all">
              <div className={`${insight.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                <Icon className="w-6 h-6" />
              </div>
              <p className="text-gray-600 text-sm font-medium">{insight.label}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{insight.value}</p>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-blue-600" />
            Notes by Tag
          </h2>
          <Pie data={pieData} />
        </div>

        {/* Bar Chart */}
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-green-600" />
            Tag Usage Insights
          </h2>
          <Bar data={barData} />
        </div>
      </div>
    </div>
  );
}
