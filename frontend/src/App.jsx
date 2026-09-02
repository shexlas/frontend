import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import SuperAdminRoute from './components/SuperAdminRoute';

const Home = lazy(() => import('./pages/Home'));
const Movies = lazy(() => import('./pages/Movies'));
const TVShows = lazy(() => import('./pages/TVShows'));
const MovieDetails = lazy(() => import('./pages/MovieDetails'));
const SeriesDetail = lazy(() => import('./pages/SeriesDetail'));
const Watch = lazy(() => import('./pages/Watch'));
const WatchEpisode = lazy(() => import('./pages/WatchEpisode'));
const Search = lazy(() => import('./pages/Search'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const Profile = lazy(() => import('./pages/Profile'));
const Favorites = lazy(() => import('./pages/Favorites'));
const Watchlist = lazy(() => import('./pages/Watchlist'));
const Staff = lazy(() => import('./pages/Staff'));
const NotFound = lazy(() => import('./pages/NotFound'));

const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminMovies = lazy(() => import('./pages/admin/AdminMovies'));
const MovieForm = lazy(() => import('./pages/admin/MovieForm'));
const AdminSeries = lazy(() => import('./pages/admin/AdminSeries'));
const SeriesForm = lazy(() => import('./pages/admin/SeriesForm'));
const SeasonForm = lazy(() => import('./pages/admin/SeasonForm'));
const EpisodeForm = lazy(() => import('./pages/admin/EpisodeForm'));
const AdminStaff = lazy(() => import('./pages/admin/AdminStaff'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminTerminal = lazy(() => import('./pages/admin/AdminTerminal'));

function RouteFallback() {
  return <div className="p-10 text-center text-gray-400">Loading...</div>;
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/tv-shows" element={<TVShows />} />
            <Route path="/movie/:id" element={<MovieDetails />} />
            <Route path="/tv-show/:id" element={<SeriesDetail />} />
            <Route path="/watch/:id" element={<ProtectedRoute><Watch /></ProtectedRoute>} />
            <Route path="/watch/episode/:id" element={<ProtectedRoute><WatchEpisode /></ProtectedRoute>} />
            <Route path="/search" element={<Search />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
            <Route path="/watchlist" element={<ProtectedRoute><Watchlist /></ProtectedRoute>} />
            <Route path="/staff" element={<Staff />} />

            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/movies" element={<AdminRoute><AdminMovies /></AdminRoute>} />
            <Route path="/admin/movies/new" element={<AdminRoute><MovieForm /></AdminRoute>} />
            <Route path="/admin/movies/:id/edit" element={<AdminRoute><MovieForm editing /></AdminRoute>} />
            <Route path="/admin/series" element={<SuperAdminRoute><AdminSeries /></SuperAdminRoute>} />
            <Route path="/admin/series/new" element={<SuperAdminRoute><SeriesForm /></SuperAdminRoute>} />
            <Route path="/admin/series/:id/edit" element={<SuperAdminRoute><SeriesForm editing /></SuperAdminRoute>} />
            <Route path="/admin/series/:seriesId/seasons/new" element={<SuperAdminRoute><SeasonForm /></SuperAdminRoute>} />
            <Route path="/admin/series/:seriesId/seasons/:id/edit" element={<SuperAdminRoute><SeasonForm editing /></SuperAdminRoute>} />
            <Route path="/admin/series/:seriesId/seasons/:seasonId/episodes/new" element={<SuperAdminRoute><EpisodeForm /></SuperAdminRoute>} />
            <Route path="/admin/series/:seriesId/seasons/:seasonId/episodes/:id/edit" element={<SuperAdminRoute><EpisodeForm editing /></SuperAdminRoute>} />
            <Route path="/admin/staff" element={<SuperAdminRoute><AdminStaff /></SuperAdminRoute>} />
            <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
            <Route path="/admin/terminal" element={<AdminRoute><AdminTerminal /></AdminRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}
