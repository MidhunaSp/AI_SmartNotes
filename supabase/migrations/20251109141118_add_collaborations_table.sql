/*
  # Add Collaborations Table

  1. New Tables
    - `note_collaborations`
      - `id` (uuid, primary key)
      - `note_id` (uuid, foreign key to notes)
      - `invited_email` (text)
      - `invited_user_id` (uuid, nullable, foreign key to auth.users)
      - `role` (text, default 'viewer')
      - `status` (text, default 'pending')
      - `created_at` (timestamp)
      - `expires_at` (timestamp, nullable)

  2. Security
    - Enable RLS
    - Note owner can manage collaborations
    - Invited users can access shared notes
*/

CREATE TABLE IF NOT EXISTS note_collaborations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id uuid NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  invited_email text NOT NULL,
  invited_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  role text DEFAULT 'viewer',
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

ALTER TABLE note_collaborations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Note owner can manage collaborations"
  ON note_collaborations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM notes WHERE notes.id = note_collaborations.note_id AND notes.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM notes WHERE notes.id = note_collaborations.note_id AND notes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view shared notes collaboration info"
  ON note_collaborations
  FOR SELECT
  TO authenticated
  USING (invited_user_id = auth.uid() OR status = 'accepted');

CREATE INDEX IF NOT EXISTS idx_note_collaborations_note_id ON note_collaborations(note_id);
CREATE INDEX IF NOT EXISTS idx_note_collaborations_invited_email ON note_collaborations(invited_email);
CREATE INDEX IF NOT EXISTS idx_note_collaborations_user_id ON note_collaborations(invited_user_id);
