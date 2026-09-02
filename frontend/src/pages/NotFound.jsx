import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <p className="text-6xl font-black gradient-text mb-3">404</p>
      <h1 className="text-2xl font-bold mb-2">Page not found</h1>
      <p className="text-gray-400 mb-6 max-w-md">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <Link to="/" className="gradient-bg px-6 py-2.5 rounded-full font-semibold">
        Back to Home
      </Link>
    </div>
  );
}
