'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { PlanFormInputs } from '@/lib/types';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function nextMonday(): string {
  const d = new Date();
  const day = d.getDay();
  const daysUntilMonday = day === 0 ? 1 : 8 - day;
  d.setDate(d.getDate() + daysUntilMonday);
  return d.toISOString().split('T')[0];
}

const DONE_TOKEN = '__PLAN_SAVED__';

export default function NewPlanPage() {
  const router = useRouter();
  const [form, setForm] = useState<PlanFormInputs>({
    weekOf: nextMonday(),
    theme: '',
    avoid: '',
    feature: '',
    easyCleanupDays: ['Wednesday'],
    easyLunchDay: 'Tuesday',
    notes: '',
  });
  const [status, setStatus] = useState<'idle' | 'generating' | 'error'>('idle');
  const [streamText, setStreamText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  function handleCleanupDayToggle(day: string) {
    setForm((prev) => ({
      ...prev,
      easyCleanupDays: prev.easyCleanupDays.includes(day)
        ? prev.easyCleanupDays.filter((d) => d !== day)
        : [...prev.easyCleanupDays, day],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('generating');
    setStreamText('');
    setErrorMessage('');

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.body) throw new Error('No response body');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        setStreamText(accumulated);

        if (accumulated.includes(DONE_TOKEN)) {
          const tokenLine = accumulated.split('\n').find((l) => l.includes(DONE_TOKEN));
          if (tokenLine) {
            const parts = tokenLine.split(':');
            const planId = parts[1];
            if (planId && planId !== 'ERROR') {
              router.push(`/plan/${planId}`);
              return;
            } else {
              const errorDetail = parts.slice(2).join(':') || 'Failed to parse response';
              setErrorMessage(`Generation failed: ${errorDetail}`);
              setStatus('error');
              return;
            }
          }
        }
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'An error occurred');
      setStatus('error');
    }
  }

  if (status === 'generating') {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Generating your meal plan…</h1>
        <p className="text-sm text-gray-500">
          Claude is searching for HEB sales and seasonal produce. This takes about 30–60 seconds.
        </p>
        <div className="text-sm font-mono text-gray-400 whitespace-pre-line">
          {streamText || 'Starting…'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">New Meal Plan</h1>

      {status === 'error' && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700">Week of</label>
          <input
            type="date"
            value={form.weekOf}
            onChange={(e) => setForm((p) => ({ ...p, weekOf: e.target.value }))}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Theme</label>
          <input
            type="text"
            placeholder="e.g. Tex-Mex, Mediterranean, Comfort food"
            value={form.theme}
            onChange={(e) => setForm((p) => ({ ...p, theme: e.target.value }))}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Avoid</label>
          <input
            type="text"
            placeholder="e.g. beef, spicy food, pasta"
            value={form.avoid}
            onChange={(e) => setForm((p) => ({ ...p, avoid: e.target.value }))}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Feature ingredient</label>
          <input
            type="text"
            placeholder="e.g. zucchini, leftover rotisserie chicken"
            value={form.feature}
            onChange={(e) => setForm((p) => ({ ...p, feature: e.target.value }))}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Easy cleanup days</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {DAYS.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => handleCleanupDayToggle(day)}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  form.easyCleanupDays.includes(day)
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Easy lunch day</label>
          <select
            value={form.easyLunchDay}
            onChange={(e) => setForm((p) => ({ ...p, easyLunchDay: e.target.value }))}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none"
          >
            {DAYS.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Additional notes</label>
          <textarea
            rows={3}
            placeholder="e.g. DATE NIGHT Friday, GUESTS Saturday, BUDGET FOCUS this week"
            value={form.notes}
            onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-700"
        >
          Generate Meal Plan
        </button>
      </form>
    </div>
  );
}
