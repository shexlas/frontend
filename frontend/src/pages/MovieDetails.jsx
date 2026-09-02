import { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api, { API_URL, errorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import MovieCard from '../components/MovieCard';
import ErrorState from '../components/ErrorState';
import NotFound from './NotFound';

function getImageSrc(url) {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_URL}${url}`;
}

export default function MovieDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [movie, setMovie] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [actionError, setActionError] = useState('');

  const load = useCallback(() => {
    setError('');
    setNotFound(false);
    setMovie(null);
    api.get(`/movies/${id}`)
      .then((r) => setMovie(r.data.movie))
      .catch((err) => {
        if (err.response?.status === 404) setNotFound(true);
        else setError(errorMessage(err, 'Could not load this movie.'));
      });
  }, [id]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!movie || !user) return;
    api.get(`/favorites/check/${movie.id}`)
      .then((r) => setIsFavorite(r.data.isFavorite))
      .catch(() => {});
    api.get(`/watchlist/check/${movie.id}`)
      .then((r) => setInWatchlist(r.data.inWatchlist))
      .catch(() => {});
  }, [movie, user]);

  async function toggleFavorite() {
    setActionError('');
    try {
      if (isFavorite) {
        await api.delete(`/favorites/${movie.id}`);
        setIsFavorite(false);
      } else {
        await api.post(`/favorites/${movie.id}`);
        setIsFavorite(true);
      }
    } catch (err) {
      setActionError(errorMessage(err, 'Could not update favorites.'));
    }
  }

  async function toggleWatchlist() {
    setActionError('');
    try {
      if (inWatchlist) {
        await api.delete(`/watchlist/${movie.id}`);
        setInWatchlist(false);
      } else {
        await api.post(`/watchlist/${movie.id}`);
        setInWatchlist(true);
      }
    } catch (err) {
      setActionError(errorMessage(err, 'Could not update watchlist.'));
    }
  }

  if (notFound) return <NotFound />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!movie) return <div className="p-10 text-center text-gray-400">Loading...</div>;

  return (
    <div>
      <div className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden">
        {movie.backdropUrl ? (
          <img src={getImageSrc(movie.backdropUrl)} className="absolute inset-0 w-full h-full object-cover opacity-50" alt="" loading="eager" />
        ) : <div className="absolute inset-0 gradient-bg opacity-20" />}
        <div className="absolute inset-0 bg-gradient-to-t from-bg to-transparent" />
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-24 relative flex flex-col md:flex-row gap-6">
        <div className="w-40 md:w-56 shrink-0 rounded-xl overflow-hidden bg-panel aspect-[2/3] shadow-2xl">
          {movie.posterUrl && <img src={getImageSrc(movie.posterUrl)} alt={`${movie.title} poster`} className="w-full h-full object-cover" loading="eager" />}
        </div>

        <div className="flex-1 pb-10">
          <h1 className="text-3xl font-black mb-2">{movie.title}</h1>
          <div className="flex flex-wrap gap-2 text-sm text-gray-400 mb-4">
            {movie.releaseYear && <span>{movie.releaseYear}</span>}
            {movie.runtime && <span>· {movie.runtime} min</span>}
            {movie.rating > 0 && <span>· ⭐ {movie.rating.toFixed(1)}</span>}
            {movie.genres?.length > 0 && <span>· {movie.genres.join(', ')}</span>}
          </div>

          <p className="text-gray-300 leading-relaxed mb-6">{movie.description}</p>

          <div className="flex gap-3 mb-6">
            {user && (
              <>
                <Link to={`/watch/${movie.slug}`} className="gradient-bg px-6 py-2.5 rounded-full font-semibold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition">
                  ▶ Watch Now
                </Link>
                <button onClick={toggleFavorite} className="bg-white/10 px-4 py-2 rounded-full hover:bg-white/20 transition">
                  {isFavorite ? '❤️ Favorited' : '🤍 Favorite'}
                </button>
                <button onClick={toggleWatchlist} className="bg-white/10 px-4 py-2 rounded-full hover:bg-white/20 transition">
                  {inWatchlist ? '✓ In Watchlist' : '+ Watchlist'}
                </button>
              </>
            )}
          </div>
          {actionError && <p className="text-red-400 text-sm mb-4">{actionError}</p>}

          <dl className="grid grid-cols-2 gap-3 text-sm mb-8">
            {movie.director && <><dt className="text-gray-500">Director</dt><dd>{movie.director}</dd></>}
            {movie.country && <><dt className="text-gray-500">Country</dt><dd>{movie.country}</dd></>}
            {movie.language && <><dt className="text-gray-500">Language</dt><dd>{movie.language}</dd></>}
          </dl>

          {movie.cast && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Cast</h3>
              <p className="text-gray-400 text-sm">{movie.cast}</p>
            </div>
          )}

          {movie.trailerUrl && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Trailer</h3>
              <a href={movie.trailerUrl} target="_blank" rel="noreferrer" className="text-purple-400 hover:text-white text-sm">
                Watch Trailer →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
