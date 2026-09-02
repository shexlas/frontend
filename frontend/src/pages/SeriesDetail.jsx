import { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api, { API_URL, errorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import ErrorState from '../components/ErrorState';
import NotFound from './NotFound';

function getImageSrc(url) {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_URL}${url}`;
}

export default function SeriesDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [series, setSeries] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setError('');
    setNotFound(false);
    setSeries(null);
    api.get(`/series/${id}`)
      .then((r) => setSeries(r.data.series))
      .catch((err) => {
        if (err.response?.status === 404) setNotFound(true);
        else setError(errorMessage(err, 'Could not load this TV show.'));
      });
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (notFound) return <NotFound />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!series) return <div className="p-10 text-center text-gray-400">Loading...</div>;

  return (
    <div>
      <div className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden">
        {series.backdropUrl ? (
          <img src={getImageSrc(series.backdropUrl)} className="absolute inset-0 w-full h-full object-cover opacity-50" alt="" loading="eager" />
        ) : <div className="absolute inset-0 gradient-bg opacity-20" />}
        <div className="absolute inset-0 bg-gradient-to-t from-bg to-transparent" />
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-24 relative flex flex-col md:flex-row gap-6">
        <div className="w-40 md:w-56 shrink-0 rounded-xl overflow-hidden bg-panel aspect-[2/3] shadow-2xl">
          {series.posterUrl && <img src={getImageSrc(series.posterUrl)} alt={`${series.title} poster`} className="w-full h-full object-cover" loading="eager" />}
        </div>

        <div className="flex-1 pb-10">
          <h1 className="text-3xl font-black mb-2">{series.title}</h1>
          <div className="flex flex-wrap gap-2 text-sm text-gray-400 mb-4">
            {series.releaseYear && <span>{series.releaseYear}</span>}
            {series.rating > 0 && <span>· ⭐ {series.rating.toFixed(1)}</span>}
            {series.genres?.length > 0 && <span>· {series.genres.join(', ')}</span>}
          </div>

          <p className="text-gray-300 leading-relaxed mb-6">{series.description}</p>

          <dl className="grid grid-cols-2 gap-3 text-sm mb-8">
            {series.language && <><dt className="text-gray-500">Language</dt><dd>{series.language}</dd></>}
            {series.country && <><dt className="text-gray-500">Country</dt><dd>{series.country}</dd></>}
          </dl>

          {series.seasons?.length > 0 && (
            <div className="space-y-8">
              {series.seasons.map((season) => (
                <div key={season.id}>
                  <h2 className="text-xl font-bold mb-1">{season.title || `Season ${season.number}`}</h2>
                  {season.description && <p className="text-gray-400 text-sm mb-3">{season.description}</p>}
                  <div className="space-y-2">
                    {(season.episodes || []).map((ep) => (
                      <div key={ep.id} className="flex items-center justify-between bg-panel border border-white/10 rounded-xl px-4 py-3">
                        <div>
                          <p className="font-medium text-sm">Ep {ep.number}: {ep.title}</p>
                          {ep.runtime && <p className="text-xs text-gray-500">{ep.runtime} min</p>}
                        </div>
                        {ep.hasVideo ? (
                          <Link to={`/watch/episode/${ep.id}`} className="text-sm gradient-bg px-4 py-1.5 rounded-full font-medium">Watch</Link>
                        ) : (
                          <span className="text-xs text-gray-500">No video</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
