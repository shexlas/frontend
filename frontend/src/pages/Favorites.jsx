import { useCallback, useEffect, useState } from 'react';
import api, { errorMessage } from '../api/client';
import MovieCard from '../components/MovieCard';
import CardGridSkeleton from '../components/CardGridSkeleton';
import ErrorState from '../components/ErrorState';

export default function Favorites() {
  const [movies, setMovies] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setError('');
    setMovies(null);
    api.get('/favorites')
      .then((r) => setMovies(r.data.movies))
      .catch((err) => setError(errorMessage(err, 'Could not load your favorites.')));
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Favorites</h1>
      {movies === null && !error && <CardGridSkeleton />}
      {error && <ErrorState message={error} onRetry={load} />}
      {movies?.length === 0 && !error && <p className="text-gray-400">No favorites yet. Add movies to see them here.</p>}
      <div className="flex flex-wrap gap-4">
        {movies?.map((m) => <MovieCard key={m.id} movie={m} />)}
      </div>
    </div>
  );
}
