import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errorMessage } from '../../api/client';
import ErrorState from '../../components/ErrorState';

export default function AdminStaff() {
  const [staff, setStaff] = useState(null);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [description, setDescription] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [adding, setAdding] = useState(false);

  const load = useCallback(() => {
    setError('');
    api.get('/staff')
      .then((r) => setStaff(r.data.staff))
      .catch((err) => setError(errorMessage(err, 'Could not load staff.')));
  }, []);
  useEffect(() => { load(); }, [load]);

  async function addStaff(e) {
    e.preventDefault();
    setActionError('');
    setAdding(true);
    try {
      await api.post('/staff', { name, position, description, profileImage });
      setName('');
      setPosition('');
      setDescription('');
      setProfileImage('');
      load();
    } catch (err) {
      setActionError(errorMessage(err, 'Could not add staff.'));
    } finally {
      setAdding(false);
    }
  }

  async function remove(s) {
    if (!window.confirm(`Remove "${s.name}" from staff?`)) return;
    setActionError('');
    try {
      await api.delete(`/staff/${s.id}`);
      load();
    } catch (err) {
      setActionError(errorMessage(err, 'Could not remove staff.'));
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Manage Staff</h1>
        <Link to="/admin" className="text-sm bg-white/10 px-4 py-2 rounded-full hover:bg-white/20 transition">
          ← Back to Dashboard
        </Link>
      </div>

      <form onSubmit={addStaff} className="bg-panel border border-white/10 rounded-xl p-5 mb-8 space-y-3">
        <h2 className="font-semibold mb-2">Add Staff Member</h2>
        <div className="grid md:grid-cols-2 gap-3">
          <input required placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className="bg-bg border border-white/10 rounded px-3 py-2" />
          <input required placeholder="Position / Role" value={position} onChange={(e) => setPosition(e.target.value)} className="bg-bg border border-white/10 rounded px-3 py-2" />
        </div>
        <input placeholder="Profile Image URL (optional)" value={profileImage} onChange={(e) => setProfileImage(e.target.value)} className="bg-bg border border-white/10 rounded px-3 py-2 w-full" />
        <textarea placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="bg-bg border border-white/10 rounded px-3 py-2 w-full" />
        {actionError && <p role="alert" className="text-red-400 text-sm">{actionError}</p>}
        <button disabled={adding} className="gradient-bg px-5 py-2 rounded-full font-medium disabled:opacity-50">
          {adding ? 'Adding...' : 'Add Staff'}
        </button>
      </form>

      {error && <ErrorState message={error} onRetry={load} />}
      {staff === null && !error && <p className="text-gray-400">Loading...</p>}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {staff?.map((s) => (
          <div key={s.id} className="bg-panel border border-white/10 rounded-xl p-5 flex items-start justify-between">
            <div>
              <h3 className="font-bold">{s.name}</h3>
              <p className="text-purple-400 text-sm">{s.position}</p>
              {s.description && <p className="text-gray-400 text-xs mt-1 line-clamp-2">{s.description}</p>}
            </div>
            <button onClick={() => remove(s)} className="text-red-400 hover:text-red-300 text-sm ml-2">Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
}
