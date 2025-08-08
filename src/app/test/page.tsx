"use client";

import { useState } from "react";
import { api } from "@/lib/axios";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function TestToolsPage() {
  const { status } = useAuthGuard();
  const [summary, setSummary] = useState("Test Event - Cron Job Test");
  const [minutesAhead, setMinutesAhead] = useState<number>(3);
  const [duration, setDuration] = useState<number>(30);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await api.post("/api/test/create-event", {
        summary,
        minutesAhead: Number(minutesAhead),
        durationMinutes: Number(duration),
      });
      setMessage(`Created: ${res.data.event.summary} @ ${res.data.event.startTime}`);
    } catch (err: any) {
      setMessage(err.response?.data?.error || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">Loading...</div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold">Test Tools</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Summary</label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Minutes Ahead</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={minutesAhead}
                min={0}
                onChange={(e) => setMinutesAhead(Number(e.target.value))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={duration}
                min={1}
                onChange={(e) => setDuration(Number(e.target.value))}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 rounded-md bg-blue-600 text-white disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Test Event"}
          </button>
        </form>

        {message && (
          <div className="text-sm text-gray-700">{message}</div>
        )}
      </div>
    </div>
  );
}


