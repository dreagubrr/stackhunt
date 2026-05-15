import { useState } from 'react';
import { NavLink, useParams, useNavigate } from 'react-router-dom';

const API = process.env.REACT_APP_API_BASE_URL;

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) return setError('Las contraseñas no coinciden');
    if (password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres');
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
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
        position: 'fixed', top: '10%', right: '5%',
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
            Nueva contraseña
          </h2>
          <p style={{ color: '#9ca3af' }} className="text-sm">Introduce tu nueva contraseña.</p>
        </div>

        {success ? (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', borderRadius: '10px' }}
            className="text-sm px-4 py-3">
            ✅ Contraseña actualizada correctamente. Redirigiendo al inicio de sesión...
          </div>
        ) : (
          <>
            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '10px' }}
                className="text-sm px-4 py-3 mb-5">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label style={{ color: '#374151', fontSize: '0.875rem', fontWeight: 500 }} className="block mb-1.5">Nueva contraseña</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                  placeholder="Mínimo 6 caracteres"
                  style={{ border: '1px solid #e5e7eb', borderRadius: '10px', color: '#0a0a0a' }}
                  className="w-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
              </div>
              <div>
                <label style={{ color: '#374151', fontSize: '0.875rem', fontWeight: 500 }} className="block mb-1.5">Confirmar contraseña</label>
                <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required
                  placeholder="Repite la contraseña"
                  style={{ border: '1px solid #e5e7eb', borderRadius: '10px', color: '#0a0a0a' }}
                  className="w-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
              </div>
              <button type="submit" disabled={loading}
                style={{ background: '#0a0a0a', borderRadius: '10px', fontWeight: 600 }}
                className="w-full text-white py-2.5 text-sm hover:bg-gray-800 transition-colors disabled:opacity-50">
                {loading ? 'Guardando...' : 'Guardar contraseña →'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;