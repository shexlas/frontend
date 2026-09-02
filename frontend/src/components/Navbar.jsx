import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [q, setQ] = useState('');
  const navigate = useNavigate();

  function onSearch(e) {
    e.preventDefault();
    if (q.trim()) navigate(`/search?q=${encodeURIComponent(q.trim())}`);
  }

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  return (
    <nav className="sticky top-0 z-50 bg-bg/90 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-4">
        <Link to="/" className="text-xl font-black tracking-wider shrink-0">
          <span className="gradient-text">FILM</span> <span className="text-white">ZONE</span>
        </Link>

        <div className="hidden md:flex items-center gap-1 ml-2">
          <Link to="/movies" className="px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition">
            Movies
          </Link>
          <Link to="/tv-shows" className="px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition">
            TV Shows
          </Link>
          <Link to="/staff" className="px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition">
            Staff
          </Link>
        </div>

        <form onSubmit={onSearch} className="flex-1 max-w-md mx-4">
          <div className="relative">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search movies, shows, actors..."
              className="w-full bg-panel border border-white/10 rounded-full px-4 py-2 pl-10 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
            />
            <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </form>

        {user ? (
          <div className="flex items-center gap-2 shrink-0">
            <Link to="/watchlist" className="hidden lg:block text-sm text-gray-300 hover:text-white px-2 py-1 rounded hover:bg-white/5 transition">
              Watchlist
            </Link>
            <Link to="/favorites" className="hidden lg:block text-sm text-gray-300 hover:text-white px-2 py-1 rounded hover:bg-white/5 transition">
              Favorites
            </Link>
            {isAdmin && (
              <Link to="/admin" className="text-sm text-purple-300 hover:text-white px-2 py-1 rounded hover:bg-white/5 transition">
                {isSuperAdmin ? 'Super Admin' : 'Admin'}
              </Link>
            )}
            <Link to="/profile" className="w-9 h-9 rounded-full gradient-bg flex items-center justify-center text-sm font-bold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition">
              {user.username[0].toUpperCase()}
            </Link>
            <button onClick={logout} className="text-sm text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-white/5 transition">
              Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 shrink-0">
            <Link to="/login" className="text-sm text-gray-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition">
              Login
            </Link>
            <Link to="/register" className="text-sm bg-white text-black px-4 py-1.5 rounded-full font-semibold hover:bg-gray-100 transition shadow-lg">
              Sign up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
