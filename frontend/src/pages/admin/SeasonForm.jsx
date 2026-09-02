import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api, { errorMessage } from '../../api/client';

export default function SeasonForm({ editing }) {
  const { seriesId, id } = useParams();
  const [number, setNumber] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing && id) {
      api.get(`/series/seasons/${id}`)
        .then((r) => {
          const s = r.data.season;
          setNumber(String(s.number));
          setTitle(s.title || '');
          setDescription(s.description || '');
        })
        .catch((err) => setError(errorMessage(err, 'Could not load season.')));
    }
  }, [editing, id]);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/series/seasons/${id}`, { number, title, description });
      } else {
        await api.post(`/series/${seriesId}/seasons`, { number, title, description });
      }
      window.history.back();
    } catch (err) {
      setError(errorMessage(err, 'Could not save season'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{editing ? 'Edit Season' : 'Add Season'}</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <input required placeholder="Season Number" type="number" value={number} onChange={(e) => setNumber(e.target.value)} className="bg-panel border border-white/10 rounded px-3 py-2" />
          <input placeholder="Season Title (optional)" value={title} onChange={(e) => setTitle(e.target.value)} className="bg-panel border border-white/10 rounded px-3 py-2" />
        </div>
        <textarea placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="bg-panel border border-white/10 rounded px-3 py-2 w-full" />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button disabled={saving} className="gradient-bg px-6 py-2.5 rounded-full font-semibold disabled:opacity-50">
          {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Season'}
        </button>
      </form>
    </div>
  );
}
