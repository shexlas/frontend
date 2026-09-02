import { useCallback, useEffect, useState } from 'react';
import api, { errorMessage } from '../api/client';
import ErrorState from '../components/ErrorState';

export default function Staff() {
  const [staff, setStaff] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setError('');
    api.get('/staff')
      .then((r) => setStaff(r.data.staff))
      .catch((err) => setError(errorMessage(err, 'Could not load staff.')));
  }, []);

  useEffect(() => { load(); }, [load]);

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!staff) return <div className="p-10 text-center text-gray-400">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8 text-center">Our Team</h1>
      {staff.length === 0 && <p className="text-gray-400 text-center">No staff members yet.</p>}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {staff.map((s) => (
          <div key={s.id} className="bg-panel border border-white/10 rounded-xl p-6 text-center hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
            <div className="w-24 h-24 mx-auto rounded-full gradient-bg flex items-center justify-center text-3xl font-bold mb-4 shadow-lg">
              {s.name[0].toUpperCase()}
            </div>
            <h3 className="font-bold text-lg">{s.name}</h3>
            <p className="text-purple-400 text-sm mb-2">{s.position}</p>
            {s.description && <p className="text-gray-400 text-xs line-clamp-3">{s.description}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
