import { useCallback, useEffect, useState } from 'react';
import api, { errorMessage } from '../../api/client';
import ErrorState from '../../components/ErrorState';

export default function AdminUsers() {
  const [users, setUsers] = useState(null);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');

  const load = useCallback(() => {
    setError('');
    api.get('/admin/users')
      .then((r) => setUsers(r.data.users))
      .catch((err) => setError(errorMessage(err, 'Could not load users.')));
  }, []);
  useEffect(() => { load(); }, [load]);

  async function toggleRole(u) {
    setActionError('');
    try {
      await api.put(`/admin/users/${u.id}`, { role: u.role === 'ADMIN' ? 'USER' : 'ADMIN' });
      load();
    } catch (err) {
      setActionError(errorMessage(err, 'Could not update this user.'));
    }
  }
  async function remove(u) {
    if (!window.confirm(`Delete user "${u.username}"?`)) return;
    setActionError('');
    try {
      await api.delete(`/admin/users/${u.id}`);
      load();
    } catch (err) {
      setActionError(errorMessage(err, 'Could not delete this user.'));
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Users</h1>
      {actionError && <p role="alert" className="text-red-400 text-sm mb-4">{actionError}</p>}
      {error && <ErrorState message={error} onRetry={load} />}
      {users === null && !error && <p className="text-gray-400">Loading...</p>}
      <div className="space-y-2">
        {users?.map((u) => (
          <div key={u.id} className="flex items-center justify-between bg-panel border border-white/10 rounded-lg px-4 py-3">
            <div>
              <p className="font-medium">{u.username} <span className="text-xs text-gray-500">({u.email})</span></p>
              <p className="text-xs text-gray-500">
                {u.role} · joined {new Date(u.createdAt).toLocaleDateString()} ·{' '}
                <span className={u.emailVerified ? 'text-green-400' : 'text-yellow-400'}>
                  {u.emailVerified ? 'Verified' : 'Unverified'}
                </span>
              </p>
            </div>
            <div className="flex gap-2 text-sm">
              <button onClick={() => toggleRole(u)} className="px-3 py-1.5 rounded bg-white/10">
                {u.role === 'ADMIN' ? 'Revoke Admin' : 'Make Admin'}
              </button>
              <button onClick={() => remove(u)} className="px-3 py-1.5 rounded bg-red-600/20 text-red-300">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
