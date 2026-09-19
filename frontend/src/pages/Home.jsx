import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { API_URL, errorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import MovieCard from '../components/MovieCard';
import ErrorState from '../components/ErrorState';

const mediaSrc = (url) => !url ? null : url.startsWith('http://') || url.startsWith('https://') ? url : `${API_URL}${url}`;
function Row({ title, movies, viewAllLink, emoji, type = 'movie' }) {
  if (movies === undefined) return <section className="mb-12"><h2 className="mb-4 px-4 text-xl font-bold">{emoji} {title}</h2><div className="flex gap-4 overflow-x-auto px-4">{[1,2,3,4,5].map((i) => <div key={i} className="w-40 shrink-0"><div className="aspect-[2/3] animate-pulse rounded-xl bg-panel" /></div>)}</div></section>;
  if (!movies?.length) return null;
  return <section className="mb-12"><div className="mb-4 flex items-center justify-between px-4"><h2 className="text-xl font-bold">{emoji} {title}</h2>{viewAllLink && <Link to={viewAllLink} className="text-sm font-medium text-purple-400 hover:text-white">View All →</Link>}</div><div className="flex gap-4 overflow-x-auto px-4 pb-2 scrollbar-thin">{movies.map((m) => <MovieCard key={m.id} movie={m} type={type} />)}</div></section>;
}

export default function Home() {
  const { user } = useAuth();
  const [top10, setTop10] = useState(); const [latest10, setLatest10] = useState(); const [popular, setPopular] = useState();
  const [top10Series, setTop10Series] = useState(); const [latest10Series, setLatest10Series] = useState(); const [continueWatching, setContinueWatching] = useState(null);
  const [hero, setHero] = useState(null); const [error, setError] = useState(''); const sectionsRef = useRef({});
  const load = useCallback(() => {
    setError('');
    api.get('/movies?sort=rating&limit=10').then(r => setTop10(r.data.movies)).catch(e => { setTop10([]); setError(errorMessage(e, 'Could not load movies.')); });
    api.get('/movies?sort=newest&limit=10').then(r => { setLatest10(r.data.movies); setHero(r.data.movies[0] || null); }).catch(e => { setLatest10([]); setError(errorMessage(e, 'Could not load movies.')); });
    api.get('/movies?sort=popular&limit=12').then(r => setPopular(r.data.movies)).catch(() => setPopular([]));
    api.get('/series?sort=rating&limit=10').then(r => setTop10Series(r.data.series)).catch(() => setTop10Series([]));
    api.get('/series?sort=newest&limit=10').then(r => setLatest10Series(r.data.series)).catch(() => setLatest10Series([]));
    if (user) api.get('/watch-progress').then(r => setContinueWatching(r.data.items)).catch(() => setContinueWatching([]));
  }, [user]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (latest10?.length || top10?.length) { const t = setTimeout(() => sectionsRef.current.latest?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 800); return () => clearTimeout(t); } }, [latest10, top10]);

  return <div className="min-h-screen">
    {hero && <section className="relative isolate min-h-[620px] overflow-hidden bg-[#070b14] md:min-h-[680px]">
      <div className="absolute inset-0">{hero.backdropUrl ? <img src={mediaSrc(hero.backdropUrl)} className="h-full w-full object-cover opacity-55" alt="" loading="eager" fetchPriority="high" /> : <div className="h-full w-full gradient-bg opacity-30" />}<div className="absolute inset-0 bg-gradient-to-r from-[#070b14] via-[#070b14]/75 to-transparent" /><div className="absolute inset-0 bg-gradient-to-t from-[#070b14] via-transparent to-black/20" /></div>
      <div className="relative mx-auto flex min-h-[620px] max-w-7xl items-end px-5 pb-10 pt-28 sm:px-8 md:min-h-[680px] lg:px-10"><div className="max-w-2xl">
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-red-400">Now streaming</p><h1 className="mb-4 max-w-xl text-4xl font-black leading-[.95] tracking-tight text-white sm:text-5xl md:text-7xl">{hero.title}</h1>
        <div className="mb-5 flex flex-wrap items-center gap-3 text-sm text-white/70">{hero.releaseYear && <span>{hero.releaseYear}</span>}{hero.rating > 0 && <span className="text-amber-300">★ {hero.rating.toFixed(1)}</span>}{hero.genres?.slice(0,2).map(g => <span key={g} className="rounded-full border border-white/15 px-2.5 py-1 text-xs">{g}</span>)}</div>
        <p className="mb-7 max-w-xl text-sm leading-6 text-white/70 line-clamp-3 sm:text-base">{hero.description}</p><div className="flex flex-wrap gap-3"><Link to={`/movie/${hero.slug}`} className="rounded-md bg-red-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-red-500">▶ Watch Now</Link><Link to={`/movie/${hero.slug}`} className="rounded-md border border-white/25 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur hover:bg-white/20">ⓘ More Info</Link></div>
        <div className="mt-8 flex items-center justify-between"><p className="text-sm font-semibold text-white/80">Featured Today</p><Link to="/movies?sort=newest" className="text-xs text-white/50 hover:text-white">Explore all →</Link></div>
        <div className="mt-3 flex gap-3 overflow-x-auto pb-2 scrollbar-thin">{latest10?.slice(0,6).map(m => <Link key={m.id} to={`/movie/${m.slug}`} className="group w-32 shrink-0 sm:w-40"><div className="relative aspect-video overflow-hidden rounded-lg border border-white/10 bg-panel"><img src={mediaSrc(m.backdropUrl || m.posterUrl)} className="h-full w-full object-cover transition duration-500 group-hover:scale-110" alt="" loading="lazy" decoding="async" /><div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" /><p className="absolute bottom-2 left-2 right-2 truncate text-xs font-semibold text-white">{m.title}</p></div></Link>)}</div>
      </div></div>
    </section>}
    <div className="pb-12 pt-10">{error && <ErrorState message={error} onRetry={load} />}
      {continueWatching?.length > 0 && <section className="mb-12"><h2 className="mb-4 px-4 text-xl font-bold">▶ Continue Watching</h2><div className="flex gap-4 overflow-x-auto px-4">{continueWatching.map(i => <Link key={i.movie.id} to={`/watch/${i.movie.slug}`} className="w-40 shrink-0"><div className="relative aspect-video overflow-hidden rounded-xl bg-panel"><img src={mediaSrc(i.movie.backdropUrl)} className="h-full w-full object-cover" alt="" loading="lazy" /><div className="absolute bottom-0 h-1 w-full bg-black/50"><div className="h-full gradient-bg" style={{ width: `${Math.min(100, i.progressSeconds / (i.durationSeconds || 1) * 100)}%` }} /></div></div><p className="mt-2 truncate text-sm">{i.movie.title}</p></Link>)}</div></section>}
      <div ref={e => sectionsRef.current.top = e}><Row title="Top 10 Movies" movies={top10} viewAllLink="/movies?sort=rating" emoji="🔥" /></div><div ref={e => sectionsRef.current.latest = e}><Row title="Latest Movies" movies={latest10} viewAllLink="/movies?sort=newest" emoji="🕐" /></div><Row title="Popular Movies" movies={popular} viewAllLink="/movies?sort=popular" emoji="⭐" /><Row title="Top 10 TV Shows" movies={top10Series} viewAllLink="/tv-shows?sort=rating" emoji="📺" type="series" /><Row title="Latest TV Shows" movies={latest10Series} viewAllLink="/tv-shows?sort=newest" emoji="📺" type="series" />
      {!error && top10?.length === 0 && latest10?.length === 0 && popular?.length === 0 && <p className="py-20 text-center text-gray-400">No content available yet. Check back soon!</p>}
    </div>
  </div>;
}
