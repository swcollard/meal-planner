'use client';

import { useState } from 'react';
import type { JournalEntry } from '@/lib/types';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface Props {
  planId: string;
  weekOf: string;
  initialEntries: JournalEntry[];
}

export function JournalSection({ planId, weekOf, initialEntries }: Props) {
  const [entries, setEntries] = useState<JournalEntry[]>(initialEntries);
  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [draftNote, setDraftNote] = useState('');
  const [saving, setSaving] = useState(false);

  function getEntry(day: string) {
    return entries.find((e) => e.day === day);
  }

  function startEdit(day: string) {
    setEditingDay(day);
    setDraftNote(getEntry(day)?.note ?? '');
  }

  async function saveEntry(day: string) {
    setSaving(true);
    const updatedEntries = entries.filter((e) => e.day !== day);
    if (draftNote.trim()) {
      updatedEntries.push({ day, note: draftNote.trim() });
    }

    try {
      const res = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, weekOf, entries: updatedEntries }),
      });
      if (res.ok) {
        setEntries(updatedEntries);
      }
    } finally {
      setSaving(false);
      setEditingDay(null);
      setDraftNote('');
    }
  }

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-5">
      <h2 className="mb-4 text-base font-semibold text-gray-900">📓 Cooking Journal</h2>
      <div className="space-y-3">
        {DAYS.map((day) => {
          const entry = getEntry(day);
          const isEditing = editingDay === day;

          return (
            <div key={day} className="flex items-start gap-3">
              <span className="w-24 flex-shrink-0 pt-0.5 text-sm font-medium text-gray-500">
                {day}
              </span>
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-2">
                    <textarea
                      autoFocus
                      rows={2}
                      value={draftNote}
                      onChange={(e) => setDraftNote(e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
                      placeholder={`How did ${day} go?`}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveEntry(day)}
                        disabled={saving}
                        className="rounded-md bg-gray-900 px-3 py-1 text-xs font-medium text-white hover:bg-gray-700 disabled:opacity-50"
                      >
                        {saving ? 'Saving…' : 'Save'}
                      </button>
                      <button
                        onClick={() => setEditingDay(null)}
                        className="rounded-md px-3 py-1 text-xs font-medium text-gray-600 hover:text-gray-900"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : entry ? (
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-gray-700">{entry.note}</p>
                    <button
                      onClick={() => startEdit(day)}
                      className="flex-shrink-0 text-xs text-gray-400 hover:text-gray-700"
                    >
                      Edit
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => startEdit(day)}
                    className="text-xs text-gray-400 hover:text-gray-700"
                  >
                    + Add note
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
