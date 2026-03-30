import { useState, useEffect } from 'react';
import { Users, Mail, Send, Check, X, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Note } from '../lib/supabase';

interface Collaboration {
  id: string;
  note_id: string;
  invited_email: string;
  status: string;
  created_at: string;
}

interface CollaboratePageProps {
  notes: Note[];
}

export default function CollaboratePage({ notes }: CollaboratePageProps) {
  const [selectedNote, setSelectedNote] = useState<string>(notes[0]?.id || '');
  const [inviteEmail, setInviteEmail] = useState('');
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchCollaborations();
  }, [selectedNote]);

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !selectedNote) {
      setMessage('Please select a note and enter an email');
      return;
    }

    setLoading(true);
    try {
      // Insert into Supabase
      const { error } = await supabase.from('note_collaborations').insert({
        note_id: selectedNote,
        invited_email: inviteEmail,
        status: 'pending',
      });
      if (error) throw error;

      // Send email via backend
      const noteTitle = notes.find((n) => n.id === selectedNote)?.title || 'Untitled Note';
      await fetch('http://localhost:5000/send-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toEmail: inviteEmail, noteTitle }),
      });

      setMessage('Invitation sent successfully!');
      setInviteEmail('');
      setTimeout(() => setMessage(''), 3000);
      await fetchCollaborations();
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchCollaborations = async () => {
    if (!selectedNote) return;
    try {
      const { data, error } = await supabase
        .from('note_collaborations')
        .select('*')
        .eq('note_id', selectedNote)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCollaborations(data || []);
    } catch (error) {
      console.error('Error fetching collaborations:', error);
    }
  };

  const handleRemove = async (collabId: string) => {
    try {
      const { error } = await supabase
        .from('note_collaborations')
        .delete()
        .eq('id', collabId);

      if (error) throw error;
      await fetchCollaborations();
    } catch (error) {
      console.error('Error removing collaboration:', error);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Collaborate</h1>
        <p className="text-gray-600">Invite others to collaborate on your notes</p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-100">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Invitation</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Note
                </label>
                <select
                  value={selectedNote}
                  onChange={(e) => {
                    setSelectedNote(e.target.value);
                    setCollaborations([]);
                  }}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Choose a note...</option>
                  {notes.map((note) => (
                    <option key={note.id} value={note.id}>
                      {note.title || 'Untitled Note'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Invite by Email
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="collaborator@email.com"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyPress={(e) => e.key === 'Enter' && handleInvite()}
                    />
                  </div>
                  <button
                    onClick={handleInvite}
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all font-medium flex items-center gap-2 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    {loading ? 'Sending...' : 'Invite'}
                  </button>
                </div>
              </div>

              {message && (
                <div
                  className={`p-4 rounded-lg ${
                    message.includes('Error')
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-green-50 text-green-700 border border-green-200'
                  }`}
                >
                  {message}
                </div>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              How Collaboration Works
            </h3>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">1</span>
                <span>Select the note you want to share</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">2</span>
                <span>Enter the email of your collaborator</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">3</span>
                <span>They'll receive an invitation to view and edit</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">4</span>
                <span>Collaborate in real-time on the note</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {selectedNote && (
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {notes.find((n) => n.id === selectedNote)?.title || 'Untitled'} - Collaborators
          </h2>

          <div className="space-y-3">
            {collaborations.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No collaborators yet</p>
                <p className="text-gray-400 text-sm mt-1">Invite someone to get started</p>
              </div>
            ) : (
              collaborations.map((collab) => (
                <div
                  key={collab.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {collab.invited_email[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{collab.invited_email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {collab.status === 'pending' ? (
                          <>
                            <Clock className="w-4 h-4 text-orange-500" />
                            <span className="text-xs text-orange-600 font-medium">Pending Acceptance</span>
                          </>
                        ) : collab.status === 'accepted' ? (
                          <>
                            <Check className="w-4 h-4 text-green-500" />
                            <span className="text-xs text-green-600 font-medium">Accepted</span>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemove(collab.id)}
                    className="p-2 hover:bg-red-100 rounded-lg transition-all text-red-600"
                    title="Remove"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
