import { useEffect, useState } from 'react';
import { useAuth } from './context/AuthContext';
import { supabase, Note, Tag } from './lib/supabase';
import { assignTagsFromContent } from './lib/tagAssignment';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import DashboardPage from './pages/DashboardPage';
import SearchPage from './pages/SearchPage';
import TagsPage from './pages/TagsPage';
import InsightsPage from './pages/InsightsPage';
import CollaboratePage from './pages/CollaboratePage';
import Sidebar from './components/Sidebar';
import NoteEditor from './components/NoteEditor';
import RightPanel from './components/RightPanel';

function App() {
  const { session, loading } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const [notes, setNotes] = useState<Note[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [noteTags, setNoteTags] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('notes');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingNotes, setLoadingNotes] = useState(false);

  useEffect(() => {
    if (session) {
      fetchNotes();
      fetchTags();
    }
  }, [session, selectedTag, activeTab]);

  const fetchNotes = async () => {
    if (!session) return;
    setLoadingNotes(true);
    try {
      let query = supabase.from('notes').select('*').eq('user_id', session.user.id);

      if (selectedTag && activeTab === 'notes') {
        query = query.in(
          'id',
          supabase
            .from('note_tags')
            .select('note_id')
            .eq('tag_id', selectedTag)
        );
      }

      const { data, error } = await query.order('updated_at', { ascending: false });
      if (error) throw error;
      setNotes(data || []);
      if (data && data.length > 0 && !selectedNote && activeTab === 'notes') {
        setSelectedNote(data[0]);
        await fetchNoteTags(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoadingNotes(false);
    }
  };

  const fetchAllNoteTags = async () => {
    try {
      const { data, error } = await supabase.from('note_tags').select('*');
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching all note tags:', error);
      return [];
    }
  };

  const fetchTags = async () => {
    if (!session) return;
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('user_id', session.user.id)
        .order('name');
      if (error) throw error;
      setTags(data || []);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const fetchNoteTags = async (noteId: string) => {
    try {
      const { data, error } = await supabase
        .from('note_tags')
        .select('tag_id')
        .eq('note_id', noteId);
      if (error) throw error;
      setNoteTags(data?.map((nt) => nt.tag_id) || []);
    } catch (error) {
      console.error('Error fetching note tags:', error);
    }
  };

  const createNote = async () => {
    if (!session) return;
    try {
      const { data, error } = await supabase
        .from('notes')
        .insert({
          user_id: session.user.id,
          title: 'Untitled Note',
          content: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      setNotes([data, ...notes]);
      setSelectedNote(data);
      setNoteTags([]);
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  const saveNote = async (title: string, content: string) => {
    if (!selectedNote || !session) return;
    try {
      const assignedTags = assignTagsFromContent(content, title);

      const { error: updateError } = await supabase
        .from('notes')
        .update({
          title,
          content,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedNote.id);

      if (updateError) throw updateError;

      for (const tagName of assignedTags) {
        let tag = tags.find((t) => t.name === tagName.name);
        if (!tag) {
          const { data: newTag, error: createTagError } = await supabase
            .from('tags')
            .insert({
              user_id: session.user.id,
              name: tagName.name,
              color: tagName.color,
            })
            .select()
            .single();
          if (createTagError) throw createTagError;
          tag = newTag;
          setTags([...tags, tag]);
        }

        const isAlreadyTagged = noteTags.includes(tag.id);
        if (!isAlreadyTagged) {
          const { error: linkError } = await supabase
            .from('note_tags')
            .insert({ note_id: selectedNote.id, tag_id: tag.id });
          if (linkError) throw linkError;
        }
      }

      setSelectedNote({ ...selectedNote, title, content });
      await fetchNotes();
      await fetchNoteTags(selectedNote.id);
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 16c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7z" fill="currentColor"/>
            </svg>
          </div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    if (authView === 'login') {
      return <LoginPage onSwitchToSignUp={() => setAuthView('signup')} />;
    } else {
      return <SignUpPage onSwitchToLogin={() => setAuthView('login')} />;
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage notes={notes} tags={tags} />;
      case 'search':
        return <SearchPage notes={notes} tags={tags} onSelectNote={(note) => {
          setSelectedNote(note);
          setActiveTab('notes');
          fetchNoteTags(note.id);
        }} />;
      case 'tags':
        return <TagsPage tags={tags} onRefresh={fetchTags} />;
      case 'insights': {
        const noteTagsMap = new Map<string, string[]>();
        notes.forEach(note => {
          noteTagsMap.set(note.id, noteTags);
        });
        return <InsightsPage notes={notes} tags={tags} noteTags={noteTagsMap} />;
      }
      case 'collaborate':
        return <CollaboratePage notes={notes} />;
      default:
        return (
          <div className="flex overflow-hidden gap-4">
            <div className="flex-1 p-8 overflow-y-auto">
              <NoteEditor
                note={selectedNote}
                tags={tags}
                noteTags={noteTags}
                onSave={saveNote}
              />
            </div>
            <RightPanel
              notes={notes}
              onSelectNote={(note) => {
                setSelectedNote(note);
                fetchNoteTags(note.id);
              }}
              onCreateNote={createNote}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab !== 'notes') setSelectedNote(null);
        }}
        tags={tags}
        onTagSelect={(tagId) => {
          setSelectedTag(selectedTag === tagId ? null : tagId);
          setSelectedNote(null);
          setActiveTab('notes');
        }}
        selectedTag={selectedTag}
      />

      <main className="flex-1 overflow-hidden p-8">
        {activeTab === 'notes' ? (
          <div className="flex gap-4 h-full overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              <NoteEditor
                note={selectedNote}
                tags={tags}
                noteTags={noteTags}
                onSave={saveNote}
              />
            </div>
            <RightPanel
              notes={selectedTag ? notes : notes}
              onSelectNote={(note) => {
                setSelectedNote(note);
                fetchNoteTags(note.id);
              }}
              onCreateNote={createNote}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </div>
        ) : (
          <div className="overflow-y-auto">
            {renderContent()}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
