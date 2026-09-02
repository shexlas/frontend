import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api, { API_URL, errorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import ErrorState from '../components/ErrorState';
import NotFound from './NotFound';

export default function WatchEpisode() {
  const { id } = useParams();
  const { user } = useAuth();
  const [episode, setEpisode] = useState(null);
  const [series, setSeries] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState('');
  const videoRef = useRef(null);

  const load = useCallback(() => {
    setError('');
    setNotFound(false);
    setEpisode(null);
    setSeries(null);
    api.get(`/series/episodes/${id}`)
      .then((r) => {
        setEpisode(r.data.episode);
        return api.get(`/series/${r.data.episode.seriesId}`);
      })
      .then((r) => setSeries(r.data.series))
      .catch((err) => {
        if (err.response?.status === 404) setNotFound(true);
        else setError(errorMessage(err, 'Could not load this episode.'));
      });
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (notFound) return <NotFound />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!episode) return <div className="p-10 text-center text-gray-400">Loading...</div>;
  if (!episode.hasVideo) return <div className="p-10 text-center text-gray-400">This episode has no video uploaded yet.</div>;

  const videoSrc = episode.videoUrl?.startsWith('http')
    ? episode.videoUrl
    : `${API_URL}/api/stream/${episode.id}?type=episode`;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <Link to={`/tv-show/${series?.slug}`} className="text-sm text-gray-400 hover:text-white">&larr; Back to {series?.title}</Link>
      <h1 className="text-2xl font-bold mt-2 mb-1">{series?.title}</h1>
      <p className="text-gray-400 text-sm mb-4">Season {episode.seasonNumber || '?'} · Episode {episode.number}: {episode.title}</p>
      <div className="rounded-xl overflow-hidden bg-black">
        <video
          ref={videoRef}
          controls
          autoPlay
          className="w-full max-h-[75vh] bg-black"
          src={videoSrc}
          aria-label={`${episode.title} video player`}
        >
          {episode.subtitles?.map((s) => (
            <track key={s.id} kind="subtitles" src={s.url?.startsWith('http') ? s.url : `${API_URL}${s.url}`} srcLang={s.language} label={s.language} />
          ))}
        </video>
      </div>
      {episode.description && <p className="text-gray-400 text-sm mt-4">{episode.description}</p>}
    </div>
  );
}
