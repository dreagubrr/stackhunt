import { useState } from 'react';
import { NavLink } from 'react-router-dom';

const API = process.env.REACT_APP_API_BASE_URL;

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setMessage(''); setError('');
    try {
      const res = await fetch(`${API}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMessage('Te hemos enviado un email con las instrucciones para recuperar tu contraseña.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#f7f6f3' }} className="min-h-screen flex items-center justify-center px-4">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />

      <div style={{
        position: 'fixed', bottom: '10%', left: '5%',
        width: '350px', height: '350px',
        background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
        borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none',
      }} />

      <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e5e7eb' }}
        className="w-full max-w-md p-8 shadow-sm">

        <div className="mb-8">
          <NavLink to="/" style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em', color: '#0a0a0a' }}>
            Stack<span style={{ color: '#6366f1' }}>Hunt</span>
          </NavLink>
          <h2 style={{ fontWeight: 700, fontSize: '1.5rem', letterSpacing: '-0.02em', color: '#0a0a0a' }} className="mt-6 mb-1">
            ¿Olvidaste tu contraseña?
          </h2>
          <p style={{ color: '#9ca3af' }} className="text-sm">
            Introduce tu email y te enviaremos un enlace para recuperarla.
          </p>
        </div>

        {message && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', borderRadius: '10px' }}
            className="text-sm px-4 py-3 mb-5">
            {message}
          </div>
        )}

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '10px' }}
            className="text-sm px-4 py-3 mb-5">
            {error}
          </div>
        )}

        {!message && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label style={{ color: '#374151', fontSize: '0.875rem', fontWeight: 500 }} className="block mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="tu@email.com"
                style={{ border: '1px solid #e5e7eb', borderRadius: '10px', color: '#0a0a0a' }}
                className="w-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
            </div>
            <button type="submit" disabled={loading}
              style={{ background: '#0a0a0a', borderRadius: '10px', fontWeight: 600 }}
              className="w-full text-white py-2.5 text-sm hover:bg-gray-800 transition-colors disabled:opacity-50">
              {loading ? 'Enviando...' : 'Enviar enlace →'}
            </button>
          </form>
        )}

        <p style={{ color: '#9ca3af' }} className="text-sm text-center mt-6">
          <NavLink to="/login" style={{ color: '#6366f1', fontWeight: 500 }} className="hover:underline">
            ← Volver al inicio de sesión
          </NavLink>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;