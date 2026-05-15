import { useState } from 'react';
import { motion } from 'framer-motion';

const API = process.env.REACT_APP_API_BASE_URL;

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/api/auth/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess(true);
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      setError('Error al enviar el mensaje. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    border: '1px solid #e5e7eb', borderRadius: '10px', color: '#0a0a0a',
    width: '100%', padding: '10px 14px', fontSize: '0.875rem',
    outline: 'none', fontFamily: "'Inter', sans-serif", background: '#fff',
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#f7f6f3', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px' }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />

      <div style={{
        position: 'fixed', top: '10%', right: '5%',
        width: '350px', height: '350px',
        background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
        borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e5e7eb', padding: '40px', width: '100%', maxWidth: '520px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
      >
        <div style={{ marginBottom: '28px' }}>
          <h2 style={{ fontWeight: 800, fontSize: '1.8rem', letterSpacing: '-0.03em', color: '#0a0a0a', marginBottom: '8px' }}>
            Contacto
          </h2>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
            ¿Tienes alguna duda o sugerencia? Escríbenos.
          </p>
        </div>

        {success && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', borderRadius: '10px', padding: '14px 16px', marginBottom: '20px', fontSize: '0.875rem' }}>
            Mensaje enviado correctamente. Te responderemos pronto.
          </div>
        )}

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '10px', padding: '14px 16px', marginBottom: '20px', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { label: 'Nombre', name: 'name', type: 'text', placeholder: 'Tu nombre completo' },
              { label: 'Correo electrónico', name: 'email', type: 'email', placeholder: 'tu@email.com' },
            ].map(({ label, name, type, placeholder }) => (
              <div key={name}>
                <label style={{ color: '#374151', fontSize: '0.8rem', fontWeight: 500, display: 'block', marginBottom: '6px' }}>{label}</label>
                <input type={type} name={name} value={form[name]} onChange={handleChange} required
                  placeholder={placeholder} style={inputStyle}
                  onFocus={e => e.target.style.boxShadow = '0 0 0 2px #6366f1'}
                  onBlur={e => e.target.style.boxShadow = 'none'} />
              </div>
            ))}

            <div>
              <label style={{ color: '#374151', fontSize: '0.8rem', fontWeight: 500, display: 'block', marginBottom: '6px' }}>Mensaje</label>
              <textarea name="message" rows="5" required value={form.message} onChange={handleChange}
                placeholder="Escribe tu mensaje aquí..."
                style={{ ...inputStyle, resize: 'none' }}
                onFocus={e => e.target.style.boxShadow = '0 0 0 2px #6366f1'}
                onBlur={e => e.target.style.boxShadow = 'none'} />
            </div>

            <button type="submit" disabled={loading}
              style={{ background: '#0a0a0a', color: '#fff', borderRadius: '10px', padding: '12px', fontWeight: 600, cursor: 'pointer', border: 'none', fontSize: '0.875rem', marginTop: '4px', opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Enviando...' : 'Enviar mensaje →'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default Contact;