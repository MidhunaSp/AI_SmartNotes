import { LayoutDashboard, FileText, Tag, Search, Users, TrendingUp, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  tags: Array<{ id: string; name: string; color: string }>;
  onTagSelect: (tagId: string) => void;
  selectedTag: string | null;
}

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
  { icon: FileText, label: 'Notes', id: 'notes' },
  { icon: Search, label: 'Search', id: 'search' },
  { icon: Users, label: 'Collaborate', id: 'collaborate' },
  { icon: TrendingUp, label: 'Insights', id: 'insights' },
];

export default function Sidebar({
  activeTab,
  onTabChange,
  tags,
  onTagSelect,
  selectedTag,
}: SidebarProps) {
  const { signOut, user } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <aside className="w-64 bg-gradient-to-b from-[#1e3a8a] to-[#1e40af] text-white h-screen flex flex-col overflow-y-auto">
      <div className="p-6 flex items-center gap-3 border-b border-white/10">
        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 16c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7z" fill="currentColor"/>
            <circle cx="9" cy="10" r="1.5" fill="currentColor"/>
            <circle cx="15" cy="10" r="1.5" fill="currentColor"/>
            <path d="M12 13c-2 0-3.5 1-4 2h8c-.5-1-2-2-4-2z" fill="currentColor"/>
          </svg>
        </div>
        <h1 className="text-xl font-bold">SmartNotes+</h1>
      </div>

      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2 mb-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-white/20 text-white shadow-lg'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>

        {tags.length > 0 && (
          <div className="border-t border-white/10 pt-4">
            <h3 className="px-4 text-xs uppercase font-semibold text-white/60 mb-3 tracking-wider">
              Tags
            </h3>
            <ul className="space-y-1">
              {tags.map((tag) => (
                <li key={tag.id}>
                  <button
                    onClick={() => onTagSelect(tag.id)}
                    className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm ${
                      selectedTag === tag.id
                        ? 'bg-white/20 text-white'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Tag className="w-4 h-4" />
                    <span className="truncate">{tag.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-2 px-4 py-3 mb-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
            {user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{user?.email || 'User'}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-lg transition-all text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
