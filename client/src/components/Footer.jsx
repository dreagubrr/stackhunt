import { NavLink } from 'react-router-dom';

const Footer = () => {
  return (
    <footer style={{ fontFamily: "'Inter', sans-serif", background: '#0a0a0a', borderTop: '1px solid #1f1f1f' }} className="mt-auto">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em' }} className="text-white">
            Stack<span style={{ color: '#6366f1' }}>Hunt</span>
          </span>
          <p style={{ color: '#6b7280', lineHeight: 1.7 }} className="text-sm mt-3">
            Buscador de empleo en tiempo real para el mercado tech español.
          </p>
        </div>
        <div>
          <p style={{ color: '#9ca3af', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }} className="mb-4">
            Navegación
          </p>
          <ul className="space-y-2 text-sm">
            {[
              { to: '/', label: 'Inicio' },
              { to: '/search', label: 'Buscar empleo' },
              { to: '/about', label: 'Sobre nosotros' },
              { to: '/contact', label: 'Contacto' },
            ].map(({ to, label }) => (
              <li key={to}>
                <NavLink to={to} style={{ color: '#6b7280' }} className="hover:text-white transition-colors duration-200">
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p style={{ color: '#9ca3af', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }} className="mb-4">
            Fuentes de empleo
          </p>
          <ul className="space-y-2 text-sm" style={{ color: '#6b7280' }}>
            <li>Tecnoempleo</li>
            <li>Jooble España</li>
            <li>Adzuna España</li>
          </ul>
        </div>
      </div>
      <div style={{ borderTop: '1px solid #1f1f1f', color: '#4b5563' }} className="text-center text-xs py-6">
        © {new Date().getFullYear()} StackHunt. Todos los derechos reservados.
      </div>
    </footer>
  );
};

export default Footer;