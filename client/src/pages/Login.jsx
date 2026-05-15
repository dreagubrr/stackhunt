import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API = process.env.REACT_APP_API_BASE_URL;

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const oauthError = new URLSearchParams(location.search).get('error');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      login(data, remember);
      navigate('/profile');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#f7f6f3' }} className="min-h-screen flex items-start justify-center px-4 pt-24 pb-16">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />

      {/* Blob decorativo */}
      <div style={{
        position: 'fixed', top: '10%', right: '5%',
        width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)',
        borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none',
      }} />

      <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e5e7eb' }}
        className="w-full max-w-md p-8 shadow-sm">

        <div className="mb-8">
          <NavLink to="/" style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em', color: '#0a0a0a' }}>
            Stack<span style={{ color: '#6366f1' }}>Hunt</span>
          </NavLink>
          <h2 style={{ fontWeight: 700, fontSize: '1.5rem', letterSpacing: '-0.02em', color: '#0a0a0a' }} className="mt-6 mb-1">
            Iniciar sesión
          </h2>
          <p style={{ color: '#9ca3af' }} className="text-sm">Bienvenido de nuevo</p>
        </div>

        {(error || oauthError) && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '10px' }}
            className="text-sm px-4 py-3 mb-5">
            {error || 'Error al iniciar sesión con proveedor externo.'}
          </div>
        )}

        <div className="space-y-3 mb-6">
          <a href={`${API}/api/auth/google`}
            style={{ border: '1px solid #e5e7eb', borderRadius: '10px', color: '#374151' }}
            className="flex items-center justify-center gap-3 w-full px-4 py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuar con Google
          </a>
          <a href={`${API}/api/auth/github`}
            style={{ border: '1px solid #e5e7eb', borderRadius: '10px', color: '#374151' }}
            className="flex items-center justify-center gap-3 w-full px-4 py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            Continuar con GitHub
          </a>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px" style={{ background: '#e5e7eb' }} />
          <span style={{ color: '#9ca3af' }} className="text-xs">o con email</span>
          <div className="flex-1 h-px" style={{ background: '#e5e7eb' }} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label style={{ color: '#374151', fontSize: '0.875rem', fontWeight: 500 }} className="block mb-1.5">Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required
              placeholder="tu@email.com"
              style={{ border: '1px solid #e5e7eb', borderRadius: '10px', color: '#0a0a0a' }}
              className="w-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
          </div>
          <div>
            <label style={{ color: '#374151', fontSize: '0.875rem', fontWeight: 500 }} className="block mb-1.5">Contraseña</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} required
              placeholder="••••••••"
              style={{ border: '1px solid #e5e7eb', borderRadius: '10px', color: '#0a0a0a' }}
              className="w-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="remember" checked={remember} onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 cursor-pointer accent-indigo-600" />
              <label htmlFor="remember" style={{ color: '#6b7280' }} className="text-sm cursor-pointer">Recordarme</label>
            </div>
            <NavLink to="/forgot-password" style={{ color: '#6366f1', fontSize: '0.8rem', fontWeight: 500 }} className="hover:underline">
              ¿Olvidaste tu contraseña?
            </NavLink>
          </div>

          <button type="submit" disabled={loading}
            style={{ background: '#0a0a0a', borderRadius: '10px', fontWeight: 600 }}
            className="w-full text-white py-2.5 text-sm hover:bg-gray-800 transition-colors disabled:opacity-50">
            {loading ? 'Entrando...' : 'Entrar →'}
          </button>
        </form>

        <p style={{ color: '#9ca3af' }} className="text-sm text-center mt-6">
          ¿No tienes cuenta?{' '}
          <NavLink to="/register" style={{ color: '#6366f1', fontWeight: 500 }} className="hover:underline">
            Regístrate
          </NavLink>
        </p>
      </div>
    </div>
  );
};

export default Login;