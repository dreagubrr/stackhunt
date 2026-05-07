import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';

const Home = () => {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#f7f6f3' }} className="min-h-screen">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden">

        {/* Gradient blob */}
        <div style={{
          position: 'absolute',
          top: '10%',
          right: '-5%',
          width: '520px',
          height: '520px',
          background: 'radial-gradient(circle, rgba(99,102,241,0.35) 0%, rgba(139,92,246,0.2) 40%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '15%',
          left: '5%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(50px)',
          pointerEvents: 'none',
        }} />

        <div className="max-w-7xl mx-auto px-6 pt-32 pb-20 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-1.5 text-xs text-gray-500 font-medium mb-8 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Datos en tiempo real · Tecnoempleo · Jooble · Adzuna
            </div>

            <h1 style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 800,
              fontSize: 'clamp(2.8rem, 7vw, 5.5rem)',
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              color: '#0a0a0a',
              maxWidth: '800px',
            }}>
              Tu próximo trabajo<br />
              <span style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>tech en España.</span>
            </h1>

            <p style={{ color: '#6b7280', maxWidth: '480px' }} className="mt-6 mb-10 text-lg leading-relaxed">
              Busca entre miles de ofertas de desarrollo, diseño e infraestructura agregadas en tiempo real.
            </p>

            <div className="flex flex-wrap gap-4">
              <NavLink to="/search"
                style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700 }}
                className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-full text-base hover:bg-gray-700 transition-all duration-200">
                Buscar empleo
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </NavLink>
              <NavLink to="/register"
                style={{ color: '#6b7280' }}
                className="inline-flex items-center gap-2 bg-white border border-gray-200 px-8 py-4 rounded-full text-base hover:border-gray-400 transition-all duration-200">
                Crear cuenta
              </NavLink>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section style={{ background: '#ffffff' }} className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <p style={{ color: '#6366f1', fontWeight: 600, fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase' }} className="mb-3">
              Por qué StackHunt
            </p>
            <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: 'clamp(1.8rem, 4vw, 3rem)', letterSpacing: '-0.02em', color: '#0a0a0a' }}>
              Todo lo que necesitas<br />para encontrar trabajo.
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                
                title: 'Tiempo real',
                desc: 'Ofertas obtenidas al instante de los portales más usados en España. Sin retrasos, sin datos obsoletos.',
              },
              {
                
                title: 'Múltiples fuentes',
                desc: 'Tecnoempleo, Jooble ES y Adzuna en una sola búsqueda. Más cobertura, menos tiempo perdido.',
              },
              {
               
                title: 'Compatibilidad IA',
                desc: 'Sube tu CV y deja que la IA analice tu perfil para mostrarte las ofertas más relevantes para ti.',
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                style={{ background: '#f7f6f3', borderRadius: '16px' }}
                className="p-8 hover:shadow-md transition-shadow duration-300"
              >
                <span className="text-3xl mb-5 block">{feature.icon}</span>
                <h3 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: '1.1rem', color: '#0a0a0a' }} className="mb-3">
                  {feature.title}
                </h3>
                <p style={{ color: '#6b7280', lineHeight: 1.7, fontSize: '0.95rem' }}>{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#0a0a0a', margin: '0', width: '100%' }} className="py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '-0.03em', color: '#ffffff', lineHeight: 1.1 }} className="mb-6">
              Tu próximo trabajo<br />empieza aquí.
            </h2>
            <p style={{ color: '#9ca3af' }} className="mb-10 text-lg">
              Crea tu perfil, conecta GitHub y deja que StackHunt haga el resto.
            </p>
            <NavLink to="/register"
              style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700 }}
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-10 py-4 rounded-full text-base hover:bg-indigo-500 transition-all duration-200">
              Empezar gratis →
            </NavLink>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;