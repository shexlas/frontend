import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api, { errorMessage } from '../api/client';
import MovieCard from '../components/MovieCard';
import CardGridSkeleton from '../components/CardGridSkeleton';
import ErrorState from '../components/ErrorState';

const CATEGORIES = [
  ['', 'هەموو', '✦'], ['Action', 'ئەکشن', '⚡'], ['Adventure', 'سەرکێشی', '🧭'], ['Comedy', 'کۆمیدی', '☺'],
  ['Drama', 'دراما', '◈'], ['Horror', 'ترسناک', '☾'], ['Sci-Fi', 'زانستی-خەیاڵی', '✧'], ['Romance', 'خۆشەویستی', '♡'],
  ['Thriller', 'هیجان', '◉'], ['Animation', 'ئەنیمەیشن', '✺'], ['Crime', 'تاوان', '⌁'], ['Mystery', 'نهێنی', '?'],
  ['Fantasy', 'فانتازیا', '✹'], ['Documentary', 'دۆکیومێنتاری', '▣'],
];

const genreName = (key) => CATEGORIES.find(([value]) => value === key)?.[1] || key;

export default function TVShows() {
  const [params, setParams] = useSearchParams();
  const sort = params.get('sort') || 'newest';
  const genre = params.get('genre') || '';
  const [series, setSeries] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setError(''); setSeries(null);
    const query = new URLSearchParams({ sort });
    if (genre) query.set('genre', genre);
    api.get(`/series?${query.toString()}`)
      .then((r) => setSeries(r.data.series))
      .catch((err) => setError(errorMessage(err, 'نەتوانرا زنجیرەکان باربکرێن.')));
  }, [sort, genre]);

  useEffect(() => { load(); }, [load]);
  const activeLabel = useMemo(() => genre ? genreName(genre) : 'هەموو ژانەرەکان', [genre]);
  const setGenre = (value) => { const next = new URLSearchParams(params); value ? next.set('genre', value) : next.delete('genre'); setParams(next); };
  const setSort = (value) => { const next = new URLSearchParams(params); next.set('sort', value); setParams(next); };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" dir="rtl">
      <section className="relative overflow-hidden rounded-3xl border border-yellow-400/20 bg-gradient-to-l from-[#151027] via-[#0b1726] to-[#07111e] p-7 md:p-10 mb-7 shadow-2xl">
        <div className="absolute -left-12 -bottom-20 h-64 w-64 rounded-full bg-red-600/20 blur-3xl" />
        <div className="relative z-10"><span className="text-xs font-black tracking-[.22em] text-yellow-400">FILMZONE • TV COLLECTION</span><h1 className="mt-2 text-4xl md:text-6xl font-black text-white">زنجیرەکان</h1><p className="mt-3 max-w-xl text-sm md:text-base leading-8 text-slate-300">زنجیرەی دڵخوازت بە ژانەرێک هەڵبژێرە و بە ئاسانی بدۆزەرەوە.</p></div>
      </section>

      <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 text-lg font-black text-white"><span className="text-red-500">✦</span><span>ژانەرەکان</span><small className="rounded-full border border-yellow-400/30 px-3 py-1 text-xs font-normal text-yellow-400">{activeLabel}</small></div>
        <div className="flex gap-1 rounded-full border border-white/10 bg-[#07111e]/80 p-1">
          {[['newest', 'نوێترین'], ['popular', 'زۆرترین بینراو']].map(([key, label]) => <button key={key} onClick={() => setSort(key)} className={`rounded-full px-4 py-2 text-xs transition ${sort === key ? 'gradient-bg text-white shadow-lg shadow-red-900/30' : 'text-slate-400 hover:bg-white/10 hover:text-white'}`}>{label}</button>)}
        </div>
      </div>

      <div className="mb-7 flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-[#07111e]/70 p-4">
        {CATEGORIES.map(([key, label, icon]) => <button key={key} onClick={() => setGenre(key)} aria-pressed={genre === key} className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs whitespace-nowrap transition hover:-translate-y-0.5 ${genre === key ? 'border-red-500 bg-gradient-to-l from-red-600 to-rose-900 text-white shadow-lg shadow-red-900/30' : 'border-white/10 bg-white/[.03] text-slate-300 hover:border-yellow-400/50 hover:bg-yellow-400/10 hover:text-white'}`}><span className={genre === key ? 'text-yellow-300' : 'text-slate-500'}>{icon}</span>{label}</button>)}
      </div>

      <div className="mb-4 flex items-center justify-between text-xs text-slate-400"><span>{genre ? `زنجیرەکانی ژانەری ${activeLabel}` : 'هەموو زنجیرە بەردەستەکان'}</span>{series && <b className="rounded bg-white/5 px-2 py-1 text-slate-200">{series.length} زنجیرە</b>}</div>
      {series === null && !error && <CardGridSkeleton />}
      {error && <ErrorState message={error} onRetry={load} />}
      {series?.length === 0 && <div className="py-20 text-center text-slate-400"><div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-yellow-400/30 text-3xl text-yellow-400">◌</div><h2 className="mt-4 text-xl font-bold text-slate-200">هیچ زنجیرەیەک نەدۆزرایەوە</h2><p className="mt-2">ژانەرێکی تر تاقی بکەرەوە.</p><button onClick={() => setGenre('')} className="mt-4 rounded-full border border-red-500/60 bg-red-500/10 px-4 py-2 text-sm text-red-300">گەڕانەوە بۆ هەموو زنجیرەکان</button></div>}
      <div className="compact-catalog-grid">{series?.map((s) => <MovieCard key={s.id} movie={s} type="series" />)}</div>
    </div>
  );
}
