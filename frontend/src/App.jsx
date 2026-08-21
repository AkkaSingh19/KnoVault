import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import DocumentDetail from './pages/DocumentDetail';
import NotFound from './pages/NotFound';
import PrivateRoute from './components/PrivateRoute';
import { Toaster } from 'sonner';

function App() {
  return (
    <BrowserRouter>
    <Toaster position="top-center" richColors closeButton />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/not-found" element={<NotFound />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/documents/:id"
          element={
            <PrivateRoute>
              <DocumentDetail />
            </PrivateRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;