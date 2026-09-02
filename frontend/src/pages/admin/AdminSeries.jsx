import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errorMessage } from '../../api/client';
import ErrorState from '../../components/ErrorState';

export default function AdminSeries() {
  const [series, setSeries] = useState(null);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');

  const load = useCallback(() => {
    setError('');
    api.get('/series')
      .then((r) => setSeries(r.data.series))
      .catch((err) => setError(errorMessage(err, 'Could not load series.')));
  }, []);
  useEffect(() => { load(); }, [load]);

  async function togglePublish(s) {
    setActionError('');
    try {
      await api.patch(`/series/${s.id}/status`, { status: s.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED' });
      load();
    } catch (err) {
      setActionError(errorMessage(err, 'Could not update series status.'));
    }
  }

  async function remove(s) {
    if (!window.confirm(`Delete "${s.title}"? This cannot be undone.`)) return;
    setActionError('');
    try {
      await api.delete(`/series/${s.id}`);
      load();
    } catch (err) {
      setActionError(errorMessage(err, 'Could not delete series.'));
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Manage TV Shows</h1>
        <Link to="/admin/series/new" className="text-sm gradient-bg px-4 py-2 rounded-full font-medium shadow-lg shadow-purple-500/30">+ Add TV Show</Link>
      </div>

      {actionError && <p role="alert" className="text-red-400 text-sm mb-4">{actionError}</p>}
      {error && <ErrorState message={error} onRetry={load} />}
      {series === null && !error && <p className="text-gray-400">Loading...</p>}
      {series?.length === 0 && <p className="text-gray-400">No TV shows yet. Add your first TV show.</p>}

      <div className="space-y-2">
        {series?.map((s) => (
          <div key={s.id} className="flex items-center justify-between bg-panel border border-white/10 rounded-xl px-4 py-3">
            <div>
              <p className="font-medium">{s.title}</p>
              <p className="text-xs text-gray-500">{s.status} · {s.views} views · {s.seasons?.length || 0} seasons</p>
            </div>
            <div className="flex gap-2 text-sm">
              <button onClick={() => togglePublish(s)} className="px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 transition">
                {s.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
              </button>
              <Link to={`/admin/series/${s.id}/edit`} className="px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 transition">Edit</Link>
              <button onClick={() => remove(s)} className="px-3 py-1.5 rounded bg-red-600/20 text-red-300 hover:bg-red-600/30 transition">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
