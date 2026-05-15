import { motion } from 'framer-motion';

const About = () => {
  const stack = [
    { icon: '⚛️', name: 'React + Tailwind CSS', desc: 'Interfaz de usuario moderna y responsive' },
    { icon: '🚀', name: 'Node.js + Express', desc: 'Backend y API REST escalable' },
    { icon: '🕸️', name: 'Cheerio + Fetch', desc: 'Scraping ligero de portales de empleo en tiempo real' },
    { icon: '📧', name: 'Brevo SMTP', desc: 'Envío de emails transaccionales y recuperación de contraseña' },
    { icon: '☁️', name: 'AWS EC2 + S3', desc: 'Despliegue en producción y almacenamiento de archivos' },
    { icon: '🍃', name: 'MongoDB Atlas', desc: 'Base de datos en la nube' },
    { icon: '📄', name: 'jsPDF + html2canvas', desc: 'Generación de CV en PDF directamente desde el perfil' },
    { icon: '🔐', name: 'Passport.js + JWT', desc: 'Autenticación con email, Google y GitHub' },
  ];

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#f7f6f3', minHeight: '100vh', paddingTop: '100px', paddingBottom: '80px' }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />

      <div style={{ position: 'fixed', top: '15%', right: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '10%', left: '-5%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(50px)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '0 24px' }}>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div style={{ marginBottom: '48px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '999px', padding: '6px 16px', fontSize: '0.75rem', color: '#6b7280', fontWeight: 500, marginBottom: '20px' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
              Proyecto Intermodular — 2ºDAW
            </div>
            <h1 style={{ fontWeight: 800, fontSize: 'clamp(2rem, 5vw, 3rem)', letterSpacing: '-0.03em', color: '#0a0a0a', lineHeight: 1.1, marginBottom: '16px' }}>
              Sobre <span style={{ color: '#6366f1' }}>StackHunt</span>
            </h1>
            <p style={{ color: '#6b7280', fontSize: '1rem', lineHeight: 1.8, maxWidth: '600px' }}>
              StackHunt es una plataforma de búsqueda de empleo tech en España que agrega ofertas en tiempo real de los principales portales del sector. Diseñada para simplificar y personalizar la búsqueda de trabajo para desarrolladores y profesionales tecnológicos.
            </p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}>
          <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e5e7eb', padding: '32px', marginBottom: '20px' }}>
            <p style={{ color: '#9ca3af', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '20px' }}>Stack tecnológico</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
              {stack.map(({ icon, name, desc }) => (
                <div key={name} style={{ background: '#f9fafb', borderRadius: '12px', padding: '14px 16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1.2rem' }}>{icon}</span>
                  <div>
                    <p style={{ fontWeight: 600, color: '#0a0a0a', fontSize: '0.875rem', marginBottom: '2px' }}>{name}</p>
                    <p style={{ color: '#9ca3af', fontSize: '0.75rem' }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}>
          <div style={{ background: '#0a0a0a', borderRadius: '20px', padding: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <p style={{ fontWeight: 700, fontSize: '1.1rem', color: '#ffffff', marginBottom: '4px' }}>¿Tienes alguna sugerencia?</p>
              <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Estaremos encantados de escucharte.</p>
            </div>
            <a href="/contact" style={{ background: '#6366f1', color: '#fff', borderRadius: '10px', padding: '10px 24px', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none', whiteSpace: 'nowrap' }}>
              Contactar →
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default About;