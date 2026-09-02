import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api, { errorMessage } from '../api/client';
import MovieCard from '../components/MovieCard';
import CardGridSkeleton from '../components/CardGridSkeleton';
import ErrorState from '../components/ErrorState';

export default function Search() {
  const [params] = useSearchParams();
  const q = params.get('q') || '';
  const [movies, setMovies] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setError('');
    if (!q) return setMovies([]);
    setMovies(null);
    api.get(`/movies/search?q=${encodeURIComponent(q)}`)
      .then((r) => setMovies(r.data.movies))
      .catch((err) => setError(errorMessage(err, 'Search failed.')));
  }, [q]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Search results for "{q}"</h1>
      {movies === null && !error && <CardGridSkeleton />}
      {error && <ErrorState message={error} onRetry={load} />}
      {movies?.length === 0 && !error && <p className="text-gray-400">No movies found.</p>}
      <div className="flex flex-wrap gap-4">
        {movies?.map((m) => <MovieCard key={m.id} movie={m} />)}
      </div>
    </div>
  );
}
