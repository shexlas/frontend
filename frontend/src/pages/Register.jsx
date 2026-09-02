import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errorMessage } from '../api/client';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(username, email, password);
      navigate('/');
    } catch (err) {
      setError(errorMessage(err, 'Registration failed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-16 px-4">
      <h1 className="text-2xl font-bold mb-6">Create your <span className="gradient-text">FILM ZONE</span> account</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <input required placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)}
          className="w-full bg-panel border border-white/10 rounded px-3 py-2 outline-none focus:border-purple-500" />
        <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-panel border border-white/10 rounded px-3 py-2 outline-none focus:border-purple-500" />
        <input type="password" required minLength={8} placeholder="Password (min 8 chars)" value={password} onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-panel border border-white/10 rounded px-3 py-2 outline-none focus:border-purple-500" />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button disabled={loading} className="w-full gradient-bg rounded py-2 font-medium disabled:opacity-50">
          {loading ? 'Creating account...' : 'Sign up'}
        </button>
      </form>
      <p className="text-sm text-gray-400 mt-4">Have an account? <Link to="/login" className="text-purple-300">Log in</Link></p>
    </div>
  );
}
