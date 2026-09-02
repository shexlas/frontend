import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { errorMessage } from '../../api/client';

const empty = {
  title: '', description: '', trailerUrl: '', releaseYear: '', runtime: '',
  rating: '', language: '', country: '', director: '', cast: '', genres: '', status: 'DRAFT',
  posterUrl: '', backdropUrl: '', videoUrl: '', subtitleUrl: '', subtitleLanguage: 'Default',
};

export default function MovieForm({ editing }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing && id) {
      api.get(`/movies/${id}`)
        .then((r) => {
          const m = r.data.movie;
          setForm({
            title: m.title, description: m.description, trailerUrl: m.trailerUrl || '',
            releaseYear: m.releaseYear || '', runtime: m.runtime || '', rating: m.rating || '',
            language: m.language || '', country: m.country || '', director: m.director || '',
            cast: m.cast || '', genres: (m.genres || []).join(', '), status: m.status,
            posterUrl: m.posterUrl || '', backdropUrl: m.backdropUrl || '',
            videoUrl: m.videoUrl || '', subtitleUrl: (m.subtitles?.[0]?.url) || '', subtitleLanguage: m.subtitles?.[0]?.language || 'Default',
          });
        })
        .catch((err) => setError(errorMessage(err, 'Could not load this movie for editing.')));
    }
  }, [editing, id]);

  function set(key, val) { setForm((f) => ({ ...f, [key]: val })); }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        ...form,
        releaseYear: form.releaseYear ? Number(form.releaseYear) : null,
        runtime: form.runtime ? Number(form.runtime) : null,
        rating: form.rating ? Number(form.rating) : null,
      };

      if (editing) await api.put(`/movies/${id}`, payload);
      else await api.post('/movies', payload);

      navigate('/admin/movies');
    } catch (err) {
      setError(errorMessage(err, 'Could not save movie'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{editing ? 'Edit Movie' : 'Add Movie'}</h1>
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
          <input placeholder="Video URL (direct MP4/WebM link)" value={form.videoUrl} onChange={(e) => set('videoUrl', e.target.value)}
            className="bg-panel border border-white/10 rounded px-3 py-2 md:col-span-2" />
          <input placeholder="Subtitle URL (SRT/VTT link)" value={form.subtitleUrl} onChange={(e) => set('subtitleUrl', e.target.value)}
            className="bg-panel border border-white/10 rounded px-3 py-2" />
          <input placeholder="Subtitle Language" value={form.subtitleLanguage} onChange={(e) => set('subtitleLanguage', e.target.value)}
            className="bg-panel border border-white/10 rounded px-3 py-2" />
          <input placeholder="Release Year" type="number" value={form.releaseYear} onChange={(e) => set('releaseYear', e.target.value)}
            className="bg-panel border border-white/10 rounded px-3 py-2" />
          <input placeholder="Runtime (minutes)" type="number" value={form.runtime} onChange={(e) => set('runtime', e.target.value)}
            className="bg-panel border border-white/10 rounded px-3 py-2" />
          <input placeholder="Rating (0-10)" type="number" step="0.1" value={form.rating} onChange={(e) => set('rating', e.target.value)}
            className="bg-panel border border-white/10 rounded px-3 py-2" />
          <input placeholder="Language" value={form.language} onChange={(e) => set('language', e.target.value)}
            className="bg-panel border border-white/10 rounded px-3 py-2" />
          <input placeholder="Country" value={form.country} onChange={(e) => set('country', e.target.value)}
            className="bg-panel border border-white/10 rounded px-3 py-2" />
          <input placeholder="Director" value={form.director} onChange={(e) => set('director', e.target.value)}
            className="bg-panel border border-white/10 rounded px-3 py-2" />
          <input placeholder="Cast (comma separated)" value={form.cast} onChange={(e) => set('cast', e.target.value)}
            className="bg-panel border border-white/10 rounded px-3 py-2 md:col-span-2" />
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
          {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Movie'}
        </button>
      </form>
    </div>
  );
}
