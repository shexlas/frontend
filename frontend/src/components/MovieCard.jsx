import { Link } from 'react-router-dom';
import { API_URL } from '../api/client';

export default function MovieCard({ movie, type = 'movie' }) {
  const basePath = type === 'series' ? '/tv-show' : '/movie';
  const posterSrc = movie.posterUrl?.startsWith('http')
    ? movie.posterUrl
    : movie.posterUrl
      ? `${API_URL}${movie.posterUrl}`
      : null;

  return (
    <Link to={`${basePath}/${movie.slug}`} className="group block w-40 sm:w-48 shrink-0">
      <div className="aspect-[2/3] rounded-xl overflow-hidden bg-panel border border-white/5 group-hover:border-purple-500/50 group-hover:shadow-lg group-hover:shadow-purple-500/20 transition-all duration-300">
        {posterSrc ? (
          <img
            src={posterSrc}
            alt={movie.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm p-2 text-center">{movie.title}</div>
        )}
      </div>
      <p className="mt-2 text-sm font-medium truncate group-hover:text-purple-300 transition-colors">{movie.title}</p>
      <p className="text-xs text-gray-400">{movie.releaseYear || ''} {movie.rating > 0 ? `· ⭐ ${movie.rating.toFixed(1)}` : ''}</p>
    </Link>
  );
}
