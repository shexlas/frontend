import { useEffect, useState, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errorMessage } from '../api/client';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { verifyEmail } = useAuth();
  const [status, setStatus] = useState('verifying'); // verifying | success | error
  const [error, setError] = useState('');
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return; // StrictMode/dev double-invoke guard - the token is single-use
    ran.current = true;

    if (!token) {
      setStatus('error');
      setError('Missing verification token.');
      return;
    }

    verifyEmail(token)
      .then(() => setStatus('success'))
      .catch((err) => {
        setStatus('error');
        setError(errorMessage(err, 'This verification link is invalid or has expired.'));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="max-w-sm mx-auto mt-16 px-4 text-center">
      {status === 'verifying' && (
        <>
          <h1 className="text-2xl font-bold mb-3">Verifying your email...</h1>
          <p className="text-gray-400">One moment.</p>
        </>
      )}
      {status === 'success' && (
        <>
          <h1 className="text-2xl font-bold mb-3">Email verified!</h1>
          <p className="text-gray-400">Your account is active and you're logged in.</p>
          <Link to="/" className="inline-block mt-6 gradient-bg rounded py-2 px-6 font-medium">
            Go to FILM ZONE
          </Link>
        </>
      )}
      {status === 'error' && (
        <>
          <h1 className="text-2xl font-bold mb-3">Verification failed</h1>
          <p className="text-red-400 text-sm">{error}</p>
          <p className="text-sm text-gray-400 mt-6">
            <Link to="/register" className="text-purple-300">Register again</Link> or{' '}
            <Link to="/login" className="text-purple-300">go to login</Link> to request a new link.
          </p>
        </>
      )}
    </div>
  );
}
