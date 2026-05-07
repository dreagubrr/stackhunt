import { motion } from 'framer-motion';

const Contact = () => {
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

        <form
          action="https://formsubmit.co/tu-email@ejemplo.com"
          method="POST"
          style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
        >
          <input type="hidden" name="_captcha" value="false" />
          <input type="hidden" name="_subject" value="Nuevo mensaje desde StackHunt" />

          {[
            { label: 'Nombre', name: 'name', type: 'text', placeholder: 'Tu nombre completo' },
            { label: 'Correo electrónico', name: 'email', type: 'email', placeholder: 'tu@email.com' },
          ].map(({ label, name, type, placeholder }) => (
            <div key={name}>
              <label style={{ color: '#374151', fontSize: '0.8rem', fontWeight: 500, display: 'block', marginBottom: '6px' }}>{label}</label>
              <input type={type} name={name} required placeholder={placeholder} style={inputStyle}
                onFocus={e => e.target.style.boxShadow = '0 0 0 2px #6366f1'}
                onBlur={e => e.target.style.boxShadow = 'none'} />
            </div>
          ))}

          <div>
            <label style={{ color: '#374151', fontSize: '0.8rem', fontWeight: 500, display: 'block', marginBottom: '6px' }}>Mensaje</label>
            <textarea name="message" rows="5" required placeholder="Escribe tu mensaje aquí..."
              style={{ ...inputStyle, resize: 'none' }}
              onFocus={e => e.target.style.boxShadow = '0 0 0 2px #6366f1'}
              onBlur={e => e.target.style.boxShadow = 'none'} />
          </div>

          <button type="submit"
            style={{ background: '#0a0a0a', color: '#fff', borderRadius: '10px', padding: '12px', fontWeight: 600, cursor: 'pointer', border: 'none', fontSize: '0.875rem', marginTop: '4px' }}>
            Enviar mensaje →
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Contact;