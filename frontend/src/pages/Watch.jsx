import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api, { API_URL, errorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import ErrorState from '../components/ErrorState';
import NotFound from './NotFound';

export default function Watch() {
  const { id } = useParams();
  const { user } = useAuth();
  const [movie, setMovie] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState('');
  const videoRef = useRef(null);
  const resumedRef = useRef(false);

  const load = useCallback(() => {
    setError('');
    setNotFound(false);
    setMovie(null);
    resumedRef.current = false;
    api.get(`/movies/${id}`)
      .then((r) => setMovie(r.data.movie))
      .catch((err) => {
        if (err.response?.status === 404) setNotFound(true);
        else setError(errorMessage(err, 'Could not load this movie.'));
      });
  }, [id]);

  useEffect(() => { load(); }, [load]);

  // Resume from saved progress once metadata is loaded
  useEffect(() => {
    if (!movie || !user || resumedRef.current) return;
    api.get(`/watch-progress/${movie.id}`)
      .then((r) => {
        const p = r.data.progress;
        if (p && videoRef.current && p.progressSeconds > 5) {
          videoRef.current.currentTime = p.progressSeconds;
        }
        resumedRef.current = true;
      })
      .catch(() => { resumedRef.current = true; });
  }, [movie, user]);

  // Save progress every 10s and on pause/unload
  useEffect(() => {
    if (!user || !movie) return;
    const video = videoRef.current;
    if (!video) return;

    function save() {
      if (!video.duration) return;
      api.post('/watch-progress', {
        movieId: movie.id,
        progressSeconds: video.currentTime,
        durationSeconds: video.duration,
      }).catch(() => {});
    }

    const interval = setInterval(save, 10000);
    video.addEventListener('pause', save);
    window.addEventListener('beforeunload', save);
    return () => {
      clearInterval(interval);
      video.removeEventListener('pause', save);
      window.removeEventListener('beforeunload', save);
      save();
    };
  }, [movie, user]);

  if (notFound) return <NotFound />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!movie) return <div className="p-10 text-center text-gray-400">Loading...</div>;
  if (!movie.hasVideo) return <div className="p-10 text-center text-gray-400">This movie has no video uploaded yet.</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <Link to={`/movie/${movie.slug}`} className="text-sm text-gray-400 hover:text-white">&larr; Back to details</Link>
      <h1 className="text-2xl font-bold mt-2 mb-4">{movie.title}</h1>
      <div className="rounded-xl overflow-hidden bg-black">
        <video
          ref={videoRef}
          controls
          autoPlay
          className="w-full max-h-[75vh] bg-black"
          src={`${API_URL}/api/stream/${movie.id}`}
          aria-label={`${movie.title} video player`}
        >
          {movie.subtitles?.map((s) => (
            <track key={s.id} kind="subtitles" src={s.url?.startsWith('http') ? s.url : `${API_URL}${s.url}`} srcLang={s.language} label={s.language} />
          ))}
        </video>
      </div>
      <p className="text-gray-400 text-sm mt-4">{movie.description}</p>
    </div>
  );
}
