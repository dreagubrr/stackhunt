import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthCallback = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const params = new URLSearchParams(location.search);
    const data = params.get('data');
    const error = params.get('error');

    if (error) {
      navigate(`/login?error=${error}`);
      return;
    }

    if (data) {
      try {
        const user = JSON.parse(decodeURIComponent(data));
        // OAuth logins
        login(user, false);
        navigate('/profile');
      } catch {
        navigate('/login?error=parse');
      }
    }
  }, [login, navigate, location.search]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500 text-sm">Iniciando sesión...</p>
    </div>
  );
};

export default AuthCallback;