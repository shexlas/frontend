import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { API_URL, errorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import MovieCard from '../components/MovieCard';
import ErrorState from '../components/ErrorState';

function mediaSrc(url) {
  if (!url) return null;
  return url.startsWith('http://') || url.startsWith('https://') ? url : `${API_URL}${url}`;
}

function RowSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto px-4 pb-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="w-40 sm:w-48 shrink-0"><div className="aspect-[2/3] rounded-xl bg-panel animate-pulse" /><div className="h-3 w-3/4 bg-panel rounded mt-2 animate-pulse" /></div>
      ))}
    </div>
  );
}

function Row({ title, movies, viewAllLink, emoji, type = 'movie' }) {
  if (movies === undefined) return <section className="mb-12"><div className="flex items-center justify-between px-4 mb-4"><h2 className="text-xl font-bold">{emoji} {title}</h2></div><RowSkeleton /></section>;
  if (!movies || movies.length === 0) return null;
  return (
    <section className="mb-12">
      <div className="flex items-center justify-between px-4 mb-4"><h2 className="text-xl font-bold">{emoji} {title}</h2>{viewAllLink && <Link to={viewAllLink} className="text-sm text-purple-400 hover:text-white transition font-medium flex items-center gap-1">View All <span className="text-lg">→</span></Link>}</div>
      <div className="flex gap-4 overflow-x-auto px-4 pb-2 scrollbar-thin">{movies.map((m) => <MovieCard key={m.id} movie={m} type={type} />)}</div>
    </section>
  );
}

function FeaturedRail({ movies }) {
  if (!movies?.length) return null;
  return (
    <div className="relative z-10 mt-8 md:mt-12">
      <div className="flex items-center justify-between mb-3"><p className="text-sm font-semibold tracking-wide text-white/80">Featured Today</p><span className="text-xs text-white/50">Explore the latest releases</span></div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
        {movies.slice(0, 6).map((movie) => (
          <Link key={movie.id} to={`/movie/${movie.slug}`} className="group w-32 sm:w-40 md:w-44 shrink-0">
            <div className="relative aspect-video overflow-hidden rounded-lg border border-white/10 bg-panel shadow-lg">
              {(movie.backdropUrl || movie.posterUrl) && <img src={mediaSrc(movie.backdropUrl || movie.posterUrl)} className="h-full w-full object-cover transition duration-500 group-hover:scale-110" alt="" loading="lazy" decoding="async" />}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" /><p className="absolute bottom-2 left-2 right-2 truncate text-xs font-semibold text-white">{movie.title}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
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
    api.get('/movies?sort=rating&limit=10').then((r) => setTop10(r.data.movies)).catch((err) => { setTop10([]); setError(errorMessage(err, 'Could not load movies.')); });
    api.get('/movies?sort=newest&limit=10').then((r) => { setLatest10(r.data.movies); setHero(r.data.movies[0] || null); }).catch((err) => { setLatest10([]); setError(errorMessage(err, 'Could not load movies.')); });
    api.get('/movies?sort=popular&limit=12').then((r) => setPopular(r.data.movies)).catch((err) => { setPopular([]); setError(errorMessage(err, 'Could not load movies.')); });
    api.get('/series?sort=rating&limit=10').then((r) => setTop10Series(r.data.series)).catch(() => setTop10Series([]));
    api.get('/series?sort=newest&limit=10').then((r) => setLatest10Series(r.data.series)).catch(() => setLatest10Series([]));
    if (user) api.get('/watch-progress').then((r) => setContinueWatching(r.data.items)).catch(() => setContinueWatching([]));
  }, [user]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (latest10?.length > 0 || top10?.length > 0) {
      const timer = setTimeout(() => { const el = sectionsRef.current['latest-movies']; if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 800);
      return () => clearTimeout(timer);
    }
  }, [latest10, top10]);

  return (
    <div className="min-h-screen">
      {hero && (
        <section className="relative isolate overflow-hidden bg-[#070b14]">
          <div className="absolute inset-0">
            {hero.backdropUrl ? <img src={mediaSrc(hero.backdropUrl)} className="h-full w-full object-cover opacity-55" alt="" loading="eager" fetchPriority="high" /> : <div className="h-full w-full gradient-bg opacity-30" />}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_35%,rgba(40,80,120,.15),transparent_40%)]" /><div className="absolute inset-0 bg-gradient-to-r from-[#070b14] via-[#070b14]/75 to-transparent" /><div className="absolute inset-0 bg-gradient-to-t from-[#070b14] via-transparent to-black/20" />
          </div>
          <div className="relative mx-auto flex min-h-[590px] max-w-7xl items-end px-5 pb-8 pt-28 sm:px-8 md:min-h-[680px] md:pb-12 lg:px-10">
            <div className="w-full max-w-2xl">
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-red-400">Now streaming</p>
              <h1 className="mb-4 max-w-xl text-4xl font-black leading-[.95] tracking-tight text-white sm:text-5xl md:text-7xl">{hero.title}</h1>
              <div className="mb-5 flex flex-wrap items-center gap-3 text-sm text-white/70">{hero.releaseYear && <span>{hero.releaseYear}</span>}{hero.rating > 0 && <span className="text-amber-300">★ {hero.rating.toFixed(1)}</span>}{hero.genres?.slice(0, 2).map((genre) => <span key={genre} className="rounded-full border border-white/15 px-2.5 py-1 text-xs">{genre}</span>)}</div>
              <p className="mb-7 max-w-xl text-sm leading-6 text-white/70 sm:text-base line-clamp-3">{hero.description}</p>
              <div className="flex flex-wrap gap-3"><Link to={`/movie/${hero.slug}`} className="rounded-md bg-red-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-red-900/30 transition hover:bg-red-500">▶ Watch Now</Link><Link to={`/movie/${hero.slug}`} className="rounded-md border border-white/25 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20">ⓘ More Info</Link></div>
              <FeaturedRail movies={latest10} />
            </div>
          </div>
        </section>
      )}
      <div className="pt-10 pb-12">
        {error && <ErrorState message={error} onRetry={load} />}
        {continueWatching?.length > 0 && <section className="mb-12"><h2 className="text-xl font-bold mb-4 px-4">▶ Continue Watching</h2><div className="flex gap-4 overflow-x-auto px-4 pb-2">{continueWatching.map((item) => <Link key={item.movie.id} to={`/watch/${item.movie.slug}`} className="w-40 sm:w-48 shrink-0"><div className="relative aspect-video overflow-hidden rounded-xl bg-panel">{item.movie.backdropUrl && <img src={mediaSrc(item.movie.backdropUrl)} className="h-full w-full object-cover" alt="" loading="lazy" decoding="async" />}<div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50"><div className="h-full gradient-bg" style={{ width: `${Math.min(100, (item.progressSeconds / (item.durationSeconds || 1)) * 100)}%` }} /></div></div><p className="mt-2 truncate text-sm">{item.movie.title}</p></Link>)}</div></section>}
        <div ref={(el) => (sectionsRef.current['top-movies'] = el)}><Row title="Top 10 Movies" movies={top10} viewAllLink="/movies?sort=rating" emoji="🔥" /></div>
        <div ref={(el) => (sectionsRef.current['latest-movies'] = el)}><Row title="Latest Movies" movies={latest10} viewAllLink="/movies?sort=newest" emoji="🕐" /></div>
        <Row title="Popular Movies" movies={popular} viewAllLink="/movies?sort=popular" emoji="⭐" />
        <div ref={(el) => (sectionsRef.current['top-series'] = el)}><Row title="Top 10 TV Shows" movies={top10Series} viewAllLink="/tv-shows?sort=rating" emoji="📺" type="series" /></div>
        <div ref={(el) => (sectionsRef.current['latest-series'] = el)}><Row title="Latest TV Shows" movies={latest10Series} viewAllLink="/tv-shows?sort=newest" emoji="📺" type="series" /></div>
        {!error && top10?.length === 0 && latest10?.length === 0 && popular?.length === 0 && top10Series?.length === 0 && latest10Series?.length === 0 && <p className="text-center text-gray-400 py-20">No content available yet. Check back soon!</p>}
      </div>
    </div>
  );
}
