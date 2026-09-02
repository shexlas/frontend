import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errorMessage } from '../../api/client';
import ErrorState from '../../components/ErrorState';
import { useAuth } from '../../context/AuthContext';

function Stat({ label, value, color }) {
  return (
    <div className={`bg-panel border border-white/10 rounded-xl p-5 ${color ? 'border-l-4 ' + color : ''}`}>
      <p className="text-gray-400 text-sm">{label}</p>
      <p className="text-3xl font-black mt-1">{value}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setError('');
    api.get('/admin/dashboard')
      .then((r) => setData(r.data))
      .catch((err) => setError(errorMessage(err, 'Could not load dashboard data.')));
  }, []);

  useEffect(() => { load(); }, [load]);

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!data) return <div className="p-10 text-center text-gray-400">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-3">
          <Link to="/admin/movies" className="text-sm bg-white/10 px-4 py-2 rounded-full hover:bg-white/20 transition">
            Manage Movies
          </Link>
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

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
        <Stat label="Total Users" value={data.totalUsers} color="border-blue-500" />
        <Stat label="Total Movies" value={data.totalMovies} color="border-purple-500" />
        <Stat label="Total Views" value={data.totalViews} color="border-green-500" />
        {data.totalSeries !== undefined && <Stat label="Total TV Shows" value={data.totalSeries} color="border-pink-500" />}
        {data.totalStaff !== undefined && <Stat label="Total Staff" value={data.totalStaff} color="border-yellow-500" />}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-panel border border-white/10 rounded-xl p-5">
          <h2 className="font-bold mb-3">Recently Added Movies</h2>
          <ul className="space-y-2">
            {data.recentMovies.map((m) => (
              <li key={m.id} className="flex justify-between bg-bg/50 border border-white/5 rounded-lg px-4 py-2 text-sm">
                <span>{m.title}</span>
                <span className={m.status === 'PUBLISHED' ? 'text-green-400' : 'text-yellow-400'}>{m.status}</span>
              </li>
            ))}
            {data.recentMovies.length === 0 && <p className="text-gray-500 text-sm">No movies yet.</p>}
          </ul>
        </div>
        <div className="bg-panel border border-white/10 rounded-xl p-5">
          <h2 className="font-bold mb-3">Recently Registered Users</h2>
          <ul className="space-y-2">
            {data.recentUsers.map((u) => (
              <li key={u.id} className="flex justify-between bg-bg/50 border border-white/5 rounded-lg px-4 py-2 text-sm">
                <span>{u.username}</span>
                <span className="text-gray-500">{u.email}</span>
              </li>
            ))}
            {data.recentUsers.length === 0 && <p className="text-gray-500 text-sm">No users yet.</p>}
          </ul>
        </div>
      </div>

      {isSuperAdmin && (
        <div className="mt-8 bg-panel border border-white/10 rounded-xl p-5">
          <h2 className="font-bold mb-3">Super Admin Tools</h2>
          <div className="flex gap-3">
            <Link to="/admin/staff" className="text-sm bg-white/10 px-4 py-2 rounded-full hover:bg-white/20 transition">
              Manage Staff
            </Link>
            <Link to="/admin/terminal" className="text-sm bg-white/10 px-4 py-2 rounded-full hover:bg-white/20 transition">
              Terminal
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
