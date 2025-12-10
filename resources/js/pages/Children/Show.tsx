import AppLayout from '@/layouts/app-layout';
import { Inertia } from '@inertiajs/inertia';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

type Note = {
  id: number;
  note: string;
  created_at: string;
  author?: { name: string | null };
};

type Child = {
  id: number;
  fullname: string;
  first_name: string;
  middle_initial?: string | null;
  last_name: string;
  sex: string;
  age: number | null;
  weight: number | null;
  height: number | null;
  barangay: string | null;
  address: string | null;
  contact_number: string | null;
  creator?: { name: string | null };
  updater?: { name: string | null };
  created_at: string;
  updated_at: string;
  notes?: Note[];
};

export default function Show({ child }: { child: Child }) {
  const [notesOpen, setNotesOpen] = useState(false);
  const [newNote, setNewNote] = useState('');

  const submitNote = (e: React.FormEvent) => {
    e.preventDefault();
    Inertia.post(`/children/${child.id}/notes`, { note: newNote });
    setNewNote('');
  };

  const deleteNote = (noteId: number) => {
    if (confirm('Delete this note?')) {
      Inertia.delete(`/children/${child.id}/notes/${noteId}`);
    }
  };

  return (
    <AppLayout>
      <Head title={`Child Details - ${child.fullname}`} />

      <div className="mx-auto max-w-3xl py-6">
        <h1 className="mb-6 text-2xl font-bold">Child Details</h1>

        <div className="space-y-4 rounded-lg bg-white p-6 shadow">
          <p><span className="font-semibold">Full Name:</span> {child.fullname}</p>
          <p><span className="font-semibold">Sex:</span> {child.sex}</p>
          <p><span className="font-semibold">Age:</span> {child.age ?? 'N/A'} months</p>
          <p><span className="font-semibold">Address:</span> {child.address ?? 'N/A'}</p>
          <p><span className="font-semibold">Contact Number:</span> {child.contact_number ?? 'N/A'}</p>
          <p><span className="font-semibold">Weight:</span> {child.weight ?? 'N/A'} kg</p>
          <p><span className="font-semibold">Height:</span> {child.height ?? 'N/A'} cm</p>
          <p><span className="font-semibold">Barangay:</span> {child.barangay ?? 'N/A'}</p>
          <p><span className="font-semibold">Created by:</span> {child.creator?.name ?? 'N/A'}</p>
          <p><span className="font-semibold">Updated by:</span> {child.updater?.name ?? 'N/A'}</p>
          <p><span className="font-semibold">Created at:</span> {new Date(child.created_at).toLocaleString()}</p>
          <p><span className="font-semibold">Last updated at:</span> {new Date(child.updated_at).toLocaleString()}</p>
        </div>

        <div className="mt-6 flex gap-4">
          <Link
            href={`/children/${child.id}/edit`}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Edit
          </Link>

          <Link
            href="/children"
            className="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
          >
            Back to List
          </Link>
        </div>

        {/* Floating Notes Button */}
        <button
          className="fixed top-36 right-4 z-50 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          onClick={() => setNotesOpen(!notesOpen)}
        >
          Notes ({child.notes?.length || 0})
        </button>

        {/* Sliding Notes Panel */}
        <div
          className={`fixed top-0 right-0 z-40 h-full w-96 bg-white shadow-lg p-4 transition-transform duration-300 ${
            notesOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <h2 className="mb-4 text-xl font-bold">Notes</h2>

          {/* Add Note */}
          <form onSubmit={submitNote} className="mb-4">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="w-full rounded border p-2"
              placeholder="Add a new note..."
            />
            <button className="mt-2 rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700">
              Add Note
            </button>
          </form>

          {/* Existing Notes */}
          {child.notes?.length ? (
            child.notes.map((note) => (
              <div key={note.id} className="mb-2 rounded bg-gray-100 p-2">
                <p>{note.note}</p>
                <small className="text-gray-500">
                  by {note.author?.name ?? 'Unknown'} on{' '}
                  {new Date(note.created_at).toLocaleString()}
                </small>
                <button
                  className="mt-1 text-red-600 hover:text-red-800"
                  onClick={() => deleteNote(note.id)}
                >
                  Delete
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No notes yet.</p>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
