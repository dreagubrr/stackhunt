import { NavLink } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-gray-300 py-10 mt-auto">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-white font-bold text-lg mb-2">🇪🇸 Job Miner</h3>
          <p className="text-sm text-gray-400">
            Buscador de empleo en tiempo real para el mercado laboral español.
          </p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-2">Navegación</h4>
          <ul className="space-y-1 text-sm">
            <li><NavLink to="/" className="hover:text-white transition">Inicio</NavLink></li>
            <li><NavLink to="/search" className="hover:text-white transition">Buscar Empleo</NavLink></li>
            <li><NavLink to="/about" className="hover:text-white transition">Sobre nosotros</NavLink></li>
            <li><NavLink to="/contact" className="hover:text-white transition">Contacto</NavLink></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-2">Fuentes de empleo</h4>
          <ul className="space-y-1 text-sm text-gray-400">
            <li>💻 Tecnoempleo</li>
            <li>📋 InfoJobs</li>
            <li>🔍 Indeed España</li>
            <li>🌐 Careerjet España</li>
          </ul>
        </div>
      </div>
      <div className="text-center text-xs text-gray-500 mt-8">
        © {new Date().getFullYear()} Job Miner España. Todos los derechos reservados.
      </div>
    </footer>
  );
};

export default Footer;
