import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API = process.env.REACT_APP_API_BASE_URL;

const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      login(data);
      navigate('/profile');
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
        position: 'fixed', top: '10%', left: '5%',
        width: '350px', height: '350px',
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
            Crear cuenta
          </h2>
          <p style={{ color: '#9ca3af' }} className="text-sm">Únete y empieza a buscar empleo</p>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '10px' }}
            className="text-sm px-4 py-3 mb-5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: 'Nombre', name: 'name', type: 'text', placeholder: 'Tu nombre' },
            { label: 'Email', name: 'email', type: 'email', placeholder: 'tu@email.com' },
            { label: 'Contraseña', name: 'password', type: 'password', placeholder: 'Mínimo 6 caracteres' },
          ].map(({ label, name, type, placeholder }) => (
            <div key={name}>
              <label style={{ color: '#374151', fontSize: '0.875rem', fontWeight: 500 }} className="block mb-1.5">{label}</label>
              <input type={type} name={name} value={form[name]} onChange={handleChange} required
                placeholder={placeholder} minLength={name === 'password' ? 6 : undefined}
                style={{ border: '1px solid #e5e7eb', borderRadius: '10px', color: '#0a0a0a' }}
                className="w-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
            </div>
          ))}

          <button type="submit" disabled={loading}
            style={{ background: '#0a0a0a', borderRadius: '10px', fontWeight: 600 }}
            className="w-full text-white py-2.5 text-sm hover:bg-gray-800 transition-colors disabled:opacity-50">
            {loading ? 'Creando cuenta...' : 'Registrarse →'}
          </button>
        </form>

        <p style={{ color: '#9ca3af' }} className="text-sm text-center mt-6">
          ¿Ya tienes cuenta?{' '}
          <NavLink to="/login" style={{ color: '#6366f1', fontWeight: 500 }} className="hover:underline">
            Inicia sesión
          </NavLink>
        </p>
      </div>
    </div>
  );
};

export default Register;