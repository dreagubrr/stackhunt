import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LOGO_TEXT = 'StackHunt';

const TypewriterLogo = () => {
  const [displayed, setDisplayed] = useState('');
  const [charIndex, setCharIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    if (charIndex < LOGO_TEXT.length) {
      const timeout = setTimeout(() => {
        setDisplayed(LOGO_TEXT.slice(0, charIndex + 1));
        setCharIndex(charIndex + 1);
      }, 120);
      return () => clearTimeout(timeout);
    }
  }, [charIndex]);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);
    return () => clearInterval(interval);
  }, []);

  return (
    <span
      style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '1rem', letterSpacing: '0.05em' }}
      className="text-gray-600"
    >
      {displayed}
      <span className="text-gray-400" style={{ opacity: showCursor ? 1 : 0 }}>_</span>
    </span>
  );
};

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();


  const linkClass = ({ isActive }) =>
    isActive ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600 transition';

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    window.location.href = '/';
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
        rel="stylesheet"
      />
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <NavLink to="/" className="flex items-center">
            <TypewriterLogo />
          </NavLink>

          {/* Desktop links */}
          <ul className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <li><NavLink to="/" className={linkClass}>Inicio</NavLink></li>
            <li><NavLink to="/search" className={linkClass}>Buscar Empleo</NavLink></li>
            <li><NavLink to="/about" className={linkClass}>Sobre nosotros</NavLink></li>
            <li><NavLink to="/contact" className={linkClass}>Contacto</NavLink></li>
            {user ? (
              <>
                <li>
                  <NavLink to="/profile" className={linkClass}>
                    {user.name.split(' ')[0]}
                  </NavLink>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="text-red-500 hover:text-red-700 transition"
                  >
                    Salir
                  </button>
                </li>
              </>
            ) : (
              <li>
                <NavLink
                  to="/login"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Entrar
                </NavLink>
              </li>
            )}
          </ul>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-gray-700 focus:outline-none"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menú"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 pb-4">
            <ul className="flex flex-col space-y-3 text-sm font-medium pt-3">
              <li><NavLink to="/" className={linkClass} onClick={() => setMenuOpen(false)}>Inicio</NavLink></li>
              <li><NavLink to="/search" className={linkClass} onClick={() => setMenuOpen(false)}>Buscar Empleo</NavLink></li>
              <li><NavLink to="/about" className={linkClass} onClick={() => setMenuOpen(false)}>Sobre nosotros</NavLink></li>
              <li><NavLink to="/contact" className={linkClass} onClick={() => setMenuOpen(false)}>Contacto</NavLink></li>
              {user ? (
                <>
                  <li><NavLink to="/profile" className={linkClass} onClick={() => setMenuOpen(false)}>Mi perfil</NavLink></li>
                  <li><button onClick={handleLogout} className="text-red-500 hover:text-red-700 transition text-left">Cerrar sesión</button></li>
                </>
              ) : (
                <li><NavLink to="/login" className={linkClass} onClick={() => setMenuOpen(false)}>Entrar</NavLink></li>
              )}
            </ul>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;