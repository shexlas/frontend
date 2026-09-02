import { useCallback, useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api, { API_URL, errorMessage } from '../api/client';
import MovieCard from '../components/MovieCard';
import CardGridSkeleton from '../components/CardGridSkeleton';
import ErrorState from '../components/ErrorState';

const CATEGORIES = [
  { key: '', label: 'All' },
  { key: 'Action', label: 'Action' },
  { key: 'Adventure', label: 'Adventure' },
  { key: 'Comedy', label: 'Comedy' },
  { key: 'Drama', label: 'Drama' },
  { key: 'Horror', label: 'Horror' },
  { key: 'Sci-Fi', label: 'Sci-Fi' },
  { key: 'Romance', label: 'Romance' },
  { key: 'Thriller', label: 'Thriller' },
];

export default function Movies() {
  const [params, setParams] = useSearchParams();
  const sort = params.get('sort') || 'newest';
  const genre = params.get('genre') || '';
  const [movies, setMovies] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setError('');
    setMovies(null);
    const query = new URLSearchParams();
    query.set('sort', sort);
    if (genre) query.set('genre', genre);
    api.get(`/movies?${query.toString()}`)
      .then((r) => setMovies(r.data.movies))
      .catch((err) => setError(errorMessage(err, 'Could not load movies.')));
  }, [sort, genre]);

  useEffect(() => { load(); }, [load]);

  const setSort = (s) => {
    const newParams = new URLSearchParams(params);
    newParams.set('sort', s);
    setParams(newParams);
  };

  const setGenre = (g) => {
    const newParams = new URLSearchParams(params);
    if (g) newParams.set('genre', g);
    else newParams.delete('genre');
    setParams(newParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold">
          {genre ? `${genre} Movies` : sort === 'rating' ? 'Top 10 Movies' : sort === 'popular' ? 'Popular Movies' : 'All Movies'}
        </h1>
        <div className="flex gap-2">
          {[
            { key: 'newest', label: 'Latest' },
            { key: 'rating', label: 'Top 10' },
            { key: 'popular', label: 'Popular' },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setSort(key)} className={`px-3 py-1.5 rounded-full text-sm ${sort === key ? 'gradient-bg text-white shadow-lg shadow-purple-500/30' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-thin">
        {CATEGORIES.map(({ key, label }) => (
          <button key={key} onClick={() => setGenre(key)} className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${genre === key ? 'gradient-bg text-white shadow-lg shadow-purple-500/30' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}>
            {label}
          </button>
        ))}
      </div>

      {movies === null && !error && <CardGridSkeleton />}
      {error && <ErrorState message={error} onRetry={load} />}
      {movies?.length === 0 && <p className="text-gray-400">No movies found.</p>}
      <div className="flex flex-wrap gap-4">
        {movies?.map((m) => <MovieCard key={m.id} movie={m} />)}
      </div>
    </div>
  );
}
