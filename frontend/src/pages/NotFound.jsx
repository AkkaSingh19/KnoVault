import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-bold mb-2">404</h1>
      <p className="text-gray-600 mb-6">This page doesn't exist, or you don't have access to it.</p>
      <Link to="/dashboard" className="px-4 py-2 bg-black text-white rounded-lg">
        Back to Dashboard
      </Link>
    </div>
  );
}

export default NotFound;