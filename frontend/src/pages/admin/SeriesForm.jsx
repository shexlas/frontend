import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { errorMessage } from '../../api/client';

const empty = {
  title: '', description: '', trailerUrl: '', releaseYear: '', rating: '',
  language: '', country: '', genres: '', status: 'DRAFT',
  posterUrl: '', backdropUrl: '',
};

function SeasonsManager({ seriesId }) {
  const [seasons, setSeasons] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setError('');
    api.get(`/series/${seriesId}`)
      .then((r) => setSeasons(r.data.series.seasons || []))
      .catch((err) => setError(errorMessage(err, 'Could not load seasons.')));
  }, [seriesId]);

  useEffect(() => { load(); }, [load]);

  async function removeSeason(season) {
    if (!window.confirm(`Delete "${season.title || `Season ${season.number}`}" and all its episodes?`)) return;
    try {
      await api.delete(`/series/seasons/${season.id}`);
      load();
    } catch (err) {
      setError(errorMessage(err, 'Could not delete season.'));
    }
  }

  async function removeEpisode(episode) {
    if (!window.confirm(`Delete episode "${episode.title}"?`)) return;
    try {
      await api.delete(`/series/episodes/${episode.id}`);
      load();
    } catch (err) {
      setError(errorMessage(err, 'Could not delete episode.'));
    }
  }

  return (
    <div className="mt-10 border-t border-white/10 pt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Seasons & Episodes</h2>
        <Link to={`/admin/series/${seriesId}/seasons/new`} className="text-sm gradient-bg px-4 py-2 rounded-full font-medium">
          + Add Season
        </Link>
      </div>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
      {seasons === null && !error && <p className="text-gray-400 text-sm">Loading...</p>}
      {seasons?.length === 0 && <p className="text-gray-400 text-sm">No seasons yet. Add the first one.</p>}

      <div className="space-y-6">
        {seasons?.map((season) => (
          <div key={season.id} className="bg-panel border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold">{season.title || `Season ${season.number}`}</p>
              <div className="flex gap-2 text-sm">
                <Link to={`/admin/series/${seriesId}/seasons/${season.id}/edit`} className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 transition">Edit</Link>
                <button onClick={() => removeSeason(season)} className="px-3 py-1 rounded bg-red-600/20 text-red-300 hover:bg-red-600/30 transition">Delete</button>
                <Link to={`/admin/series/${seriesId}/seasons/${season.id}/episodes/new`} className="px-3 py-1 rounded gradient-bg font-medium">+ Add Episode</Link>
              </div>
            </div>

            {(season.episodes || []).length === 0 ? (
              <p className="text-gray-500 text-xs">No episodes yet.</p>
            ) : (
              <div className="space-y-1">
                {season.episodes.map((ep) => (
                  <div key={ep.id} className="flex items-center justify-between bg-bg/50 border border-white/5 rounded-lg px-3 py-2 text-sm">
                    <span>Ep {ep.number}: {ep.title} {!ep.videoPath && !ep.hasVideo && <span className="text-gray-500 text-xs">(no video)</span>}</span>
                    <div className="flex gap-2">
                      <Link to={`/admin/series/${seriesId}/seasons/${season.id}/episodes/${ep.id}/edit`} className="text-purple-300 hover:text-white">Edit</Link>
                      <button onClick={() => removeEpisode(ep)} className="text-red-400 hover:text-red-300">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SeriesForm({ editing }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing && id) {
      api.get(`/series/${id}`)
        .then((r) => {
          const s = r.data.series;
          setForm({
            title: s.title, description: s.description, trailerUrl: s.trailerUrl || '',
            releaseYear: s.releaseYear || '', rating: s.rating || '', language: s.language || '',
            country: s.country || '', genres: (s.genres || []).join(', '), status: s.status,
            posterUrl: s.posterUrl || '', backdropUrl: s.backdropUrl || '',
          });
        })
        .catch((err) => setError(errorMessage(err, 'Could not load this TV show for editing.')));
    }
  }, [editing, id]);

  function set(key, val) { setForm((f) => ({ ...f, [key]: val })); }

  async function onSubmit(e) {
    e.preventDefault();
    setError(''); setSaving(true);
    try {
      const payload = {
        ...form,
        releaseYear: form.releaseYear ? Number(form.releaseYear) : null,
        rating: form.rating ? Number(form.rating) : null,
      };

      if (editing) {
        await api.put(`/series/${id}`, payload);
        navigate('/admin/series');
      } else {
        const { data } = await api.post('/series', payload);
        // New series: jump straight into editing it so the admin can
        // immediately add seasons/episodes instead of bouncing back to the
        // list and having to re-open it.
        navigate(`/admin/series/${data.series.id}/edit`, { replace: true });
      }
    } catch (err) {
      setError(errorMessage(err, 'Could not save TV show'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{editing ? 'Edit TV Show' : 'Add TV Show'}</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <input required placeholder="Title" value={form.title} onChange={(e) => set('title', e.target.value)}
            className="bg-panel border border-white/10 rounded px-3 py-2 md:col-span-2" />
          <textarea required placeholder="Description" value={form.description} onChange={(e) => set('description', e.target.value)}
            rows={4} className="bg-panel border border-white/10 rounded px-3 py-2 md:col-span-2" />
          <input placeholder="Trailer URL (YouTube etc.)" value={form.trailerUrl} onChange={(e) => set('trailerUrl', e.target.value)}
            className="bg-panel border border-white/10 rounded px-3 py-2 md:col-span-2" />
          <input placeholder="Poster Image URL" value={form.posterUrl} onChange={(e) => set('posterUrl', e.target.value)}
            className="bg-panel border border-white/10 rounded px-3 py-2 md:col-span-2" />
          <input placeholder="Backdrop Image URL" value={form.backdropUrl} onChange={(e) => set('backdropUrl', e.target.value)}
            className="bg-panel border border-white/10 rounded px-3 py-2 md:col-span-2" />
          <input placeholder="Release Year" type="number" value={form.releaseYear} onChange={(e) => set('releaseYear', e.target.value)}
            className="bg-panel border border-white/10 rounded px-3 py-2" />
          <input placeholder="Rating (0-10)" type="number" step="0.1" value={form.rating} onChange={(e) => set('rating', e.target.value)}
            className="bg-panel border border-white/10 rounded px-3 py-2" />
          <input placeholder="Language" value={form.language} onChange={(e) => set('language', e.target.value)}
            className="bg-panel border border-white/10 rounded px-3 py-2" />
          <input placeholder="Country" value={form.country} onChange={(e) => set('country', e.target.value)}
            className="bg-panel border border-white/10 rounded px-3 py-2" />
          <input placeholder="Genres (comma separated, e.g. Action, Drama)" value={form.genres} onChange={(e) => set('genres', e.target.value)}
            className="bg-panel border border-white/10 rounded px-3 py-2 md:col-span-2" />
          <select value={form.status} onChange={(e) => set('status', e.target.value)}
            className="bg-panel border border-white/10 rounded px-3 py-2">
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
          </select>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button disabled={saving} className="gradient-bg px-6 py-2.5 rounded-full font-semibold disabled:opacity-50">
          {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create TV Show'}
        </button>
      </form>

      {editing && id && <SeasonsManager seriesId={id} />}
    </div>
  );
}
