import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errorMessage } from '../../api/client';
import ErrorState from '../../components/ErrorState';
import { useAuth } from '../../context/AuthContext';

export default function AdminMovies() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const [movies, setMovies] = useState(null);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');

  const load = useCallback(() => {
    setError('');
    api.get('/movies')
      .then((r) => setMovies(r.data.movies))
      .catch((err) => setError(errorMessage(err, 'Could not load movies.')));
  }, []);
  useEffect(() => { load(); }, [load]);

  async function togglePublish(m) {
    setActionError('');
    try {
      await api.patch(`/movies/${m.id}/status`, { status: m.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED' });
      load();
    } catch (err) {
      setActionError(errorMessage(err, 'Could not update movie status.'));
    }
  }

  async function remove(m) {
    if (!window.confirm(`Delete "${m.title}"? This cannot be undone.`)) return;
    setActionError('');
    try {
      await api.delete(`/movies/${m.id}`);
      load();
    } catch (err) {
      setActionError(errorMessage(err, 'Could not delete movie.'));
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Manage Movies</h1>
        <div className="flex gap-3">
          {isSuperAdmin && (
            <Link to="/admin/series" className="text-sm bg-white/10 px-4 py-2 rounded-full hover:bg-white/20 transition">
              Manage TV Shows
            </Link>
          )}
          {isSuperAdmin && (
            <Link to="/admin/staff" className="text-sm bg-white/10 px-4 py-2 rounded-full hover:bg-white/20 transition">
              Manage Staff
            </Link>
          )}
          <Link to="/admin/movies/new" className="text-sm gradient-bg px-4 py-2 rounded-full font-medium shadow-lg shadow-purple-500/30">
            + Add Movie
          </Link>
        </div>
      </div>

      {actionError && <p role="alert" className="text-red-400 text-sm mb-4">{actionError}</p>}
      {error && <ErrorState message={error} onRetry={load} />}
      {movies === null && !error && <p className="text-gray-400">Loading...</p>}
      {movies?.length === 0 && <p className="text-gray-400">No movies yet. Add your first movie.</p>}

      <div className="space-y-2">
        {movies?.map((m) => (
          <div key={m.id} className="flex items-center justify-between bg-panel border border-white/10 rounded-xl px-4 py-3">
            <div>
              <p className="font-medium">{m.title}</p>
              <p className="text-xs text-gray-500">{m.status} · {m.views} views</p>
            </div>
            <div className="flex gap-2 text-sm">
              <button onClick={() => togglePublish(m)} className="px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 transition">
                {m.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
              </button>
              <Link to={`/admin/movies/${m.id}/edit`} className="px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 transition">Edit</Link>
              <button onClick={() => remove(m)} className="px-3 py-1.5 rounded bg-red-600/20 text-red-300 hover:bg-red-600/30 transition">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
