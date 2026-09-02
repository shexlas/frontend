import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { API_URL, errorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import MovieCard from '../components/MovieCard';
import ErrorState from '../components/ErrorState';

// Posters/backdrops are external URLs now (see MovieForm), but may still be
// a relative /uploads path for older records - only prefix with API_URL
// when the value isn't already absolute.
function mediaSrc(url) {
  if (!url) return null;
  return url.startsWith('http://') || url.startsWith('https://') ? url : `${API_URL}${url}`;
}

function RowSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto px-4 pb-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="w-40 sm:w-48 shrink-0">
          <div className="aspect-[2/3] rounded-xl bg-panel animate-pulse" />
          <div className="h-3 w-3/4 bg-panel rounded mt-2 animate-pulse" />
        </div>
      ))}
    </div>
  );
}

function Row({ title, movies, viewAllLink, emoji, type = 'movie' }) {
  if (movies === undefined) {
    return (
      <section className="mb-12">
        <div className="flex items-center justify-between px-4 mb-4">
          <h2 className="text-xl font-bold">{emoji} {title}</h2>
        </div>
        <RowSkeleton />
      </section>
    );
  }
  if (!movies || movies.length === 0) return null;
  return (
    <section className="mb-12">
      <div className="flex items-center justify-between px-4 mb-4">
        <h2 className="text-xl font-bold">{emoji} {title}</h2>
        {viewAllLink && (
          <Link to={viewAllLink} className="text-sm text-purple-400 hover:text-white transition font-medium flex items-center gap-1">
            View All <span className="text-lg">→</span>
          </Link>
        )}
      </div>
      <div className="flex gap-4 overflow-x-auto px-4 pb-2 scrollbar-thin">
        {movies.map((m) => <MovieCard key={m.id} movie={m} type={type} />)}
      </div>
    </section>
  );
}

export default function Home() {
  const { user } = useAuth();
  const [top10, setTop10] = useState(undefined);
  const [latest10, setLatest10] = useState(undefined);
  const [popular, setPopular] = useState(undefined);
  const [top10Series, setTop10Series] = useState(undefined);
  const [latest10Series, setLatest10Series] = useState(undefined);
  const [continueWatching, setContinueWatching] = useState(null);
  const [hero, setHero] = useState(null);
  const [error, setError] = useState('');
  const sectionsRef = useRef({});

  const load = useCallback(() => {
    setError('');
    api.get('/movies?sort=rating&limit=10')
      .then((r) => setTop10(r.data.movies))
      .catch((err) => { setTop10([]); setError(errorMessage(err, 'Could not load movies.')); });

    api.get('/movies?sort=newest&limit=10')
      .then((r) => { setLatest10(r.data.movies); setHero(r.data.movies[0] || null); })
      .catch((err) => { setLatest10([]); setError(errorMessage(err, 'Could not load movies.')); });

    api.get('/movies?sort=popular&limit=12')
      .then((r) => setPopular(r.data.movies))
      .catch((err) => { setPopular([]); setError(errorMessage(err, 'Could not load movies.')); });

    api.get('/series?sort=rating&limit=10')
      .then((r) => setTop10Series(r.data.series))
      .catch((err) => { setTop10Series([]); });

    api.get('/series?sort=newest&limit=10')
      .then((r) => setLatest10Series(r.data.series))
      .catch((err) => { setLatest10Series([]); });

    if (user) {
      api.get('/watch-progress')
        .then((r) => setContinueWatching(r.data.items))
        .catch(() => setContinueWatching([]));
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (latest10?.length > 0 || top10?.length > 0) {
      const timer = setTimeout(() => {
        const el = sectionsRef.current['latest-movies'];
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [latest10, top10]);

  return (
    <div>
      {hero && (
        <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
          {hero.backdropUrl ? (
            <img
              src={mediaSrc(hero.backdropUrl)}
              className="absolute inset-0 w-full h-full object-cover opacity-60"
              alt=""
              loading="eager"
              fetchpriority="high"
            />
          ) : (
            <div className="absolute inset-0 gradient-bg opacity-30" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6 md:p-10 max-w-2xl">
            <h1 className="text-3xl md:text-5xl font-black mb-3 gradient-text">{hero.title}</h1>
            <p className="text-gray-300 line-clamp-3 mb-5 hidden sm:block">{hero.description}</p>
            <Link to={`/movie/${hero.slug}`} className="gradient-bg px-6 py-2.5 rounded-full font-semibold inline-block shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition">
              ▶ Watch Now
            </Link>
          </div>
        </div>
      )}

      <div className="pt-8 pb-12">
        {error && <ErrorState message={error} onRetry={load} />}

        {continueWatching?.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-bold mb-4 px-4">▶ Continue Watching</h2>
            <div className="flex gap-4 overflow-x-auto px-4 pb-2">
              {continueWatching.map((item) => (
                <Link key={item.movie.id} to={`/watch/${item.movie.slug}`} className="w-40 sm:w-48 shrink-0">
                  <div className="aspect-video rounded-xl overflow-hidden bg-panel relative">
                    {item.movie.backdropUrl && (
                      <img
                        src={mediaSrc(item.movie.backdropUrl)}
                        className="w-full h-full object-cover"
                        alt=""
                        loading="lazy"
                        decoding="async"
                      />
                    )}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
                      <div className="h-full gradient-bg" style={{ width: `${Math.min(100, (item.progressSeconds / (item.durationSeconds || 1)) * 100)}%` }} />
                    </div>
                  </div>
                  <p className="mt-2 text-sm truncate">{item.movie.title}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div ref={(el) => (sectionsRef.current['top-movies'] = el)}>
          <Row title="Top 10 Movies" movies={top10} viewAllLink="/movies?sort=rating" emoji="🔥" />
        </div>

        <div ref={(el) => (sectionsRef.current['latest-movies'] = el)}>
          <Row title="Latest Movies" movies={latest10} viewAllLink="/movies?sort=newest" emoji="🕐" />
        </div>

        <Row title="Popular Movies" movies={popular} viewAllLink="/movies?sort=popular" emoji="⭐" />

        <div ref={(el) => (sectionsRef.current['top-series'] = el)}>
          <Row title="Top 10 TV Shows" movies={top10Series} viewAllLink="/tv-shows?sort=rating" emoji="📺" type="series" />
        </div>

        <div ref={(el) => (sectionsRef.current['latest-series'] = el)}>
          <Row title="Latest TV Shows" movies={latest10Series} viewAllLink="/tv-shows?sort=newest" emoji="📺" type="series" />
        </div>

        {!error && top10?.length === 0 && latest10?.length === 0 && popular?.length === 0 && top10Series?.length === 0 && latest10Series?.length === 0 && (
          <p className="text-center text-gray-400 py-20">No content available yet. Check back soon!</p>
        )}
      </div>
    </div>
  );
}
