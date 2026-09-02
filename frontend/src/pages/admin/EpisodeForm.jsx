import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api, { errorMessage } from '../../api/client';

const empty = {
  number: '', title: '', description: '', runtime: '', trailerUrl: '',
  videoUrl: '', subtitleUrl: '', subtitleLanguage: 'Default',
};

export default function EpisodeForm({ editing }) {
  const { seriesId, seasonId, id } = useParams();
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing && id) {
      api.get(`/series/episodes/${id}`)
        .then((r) => {
          const ep = r.data.episode;
          setForm({
            number: String(ep.number), title: ep.title, description: ep.description || '',
            runtime: ep.runtime || '', trailerUrl: ep.trailerUrl || '',
            videoUrl: ep.videoUrl || '',
            subtitleUrl: ep.subtitles?.[0]?.url || '', subtitleLanguage: ep.subtitles?.[0]?.language || 'Default',
          });
        })
        .catch((err) => setError(errorMessage(err, 'Could not load episode.')));
    }
  }, [editing, id]);

  function set(key, val) { setForm((f) => ({ ...f, [key]: val })); }

  async function onSubmit(e) {
    e.preventDefault();
    setError(''); setSaving(true);
    try {
      const payload = {
        ...form,
        number: parseInt(form.number, 10) || 1,
        runtime: form.runtime ? parseInt(form.runtime, 10) : null,
      };

      if (editing) await api.put(`/series/episodes/${id}`, payload);
      else await api.post(`/series/${seriesId}/seasons/${seasonId}/episodes`, payload);

      window.history.back();
    } catch (err) {
      setError(errorMessage(err, 'Could not save episode'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{editing ? 'Edit Episode' : 'Add Episode'}</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <input required placeholder="Episode Number" type="number" value={form.number} onChange={(e) => set('number', e.target.value)} className="bg-panel border border-white/10 rounded px-3 py-2" />
          <input required placeholder="Episode Title" value={form.title} onChange={(e) => set('title', e.target.value)} className="bg-panel border border-white/10 rounded px-3 py-2" />
        </div>
        <textarea required placeholder="Description" value={form.description} onChange={(e) => set('description', e.target.value)} rows={4} className="bg-panel border border-white/10 rounded px-3 py-2 md:col-span-2" />
        <div className="grid md:grid-cols-2 gap-4">
          <input placeholder="Video URL (direct MP4/WebM link)" value={form.videoUrl} onChange={(e) => set('videoUrl', e.target.value)} className="bg-panel border border-white/10 rounded px-3 py-2 md:col-span-2" />
          <input placeholder="Subtitle URL (SRT/VTT link)" value={form.subtitleUrl} onChange={(e) => set('subtitleUrl', e.target.value)} className="bg-panel border border-white/10 rounded px-3 py-2" />
          <input placeholder="Subtitle Language" value={form.subtitleLanguage} onChange={(e) => set('subtitleLanguage', e.target.value)} className="bg-panel border border-white/10 rounded px-3 py-2" />
          <input placeholder="Runtime (minutes)" type="number" value={form.runtime} onChange={(e) => set('runtime', e.target.value)} className="bg-panel border border-white/10 rounded px-3 py-2" />
          <input placeholder="Trailer URL" value={form.trailerUrl} onChange={(e) => set('trailerUrl', e.target.value)} className="bg-panel border border-white/10 rounded px-3 py-2" />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button disabled={saving} className="gradient-bg px-6 py-2.5 rounded-full font-semibold disabled:opacity-50">
          {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Episode'}
        </button>
      </form>
    </div>
  );
}
