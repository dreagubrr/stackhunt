import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';

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

  // Blinking cursor
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);
    return () => clearInterval(interval);
  }, []);

  return (
    <span
      style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '1rem', letterSpacing: '0.05em' }}
      className="text-gray-400"
    >
      {displayed}
      <span className="text-gray-400" style={{ opacity: showCursor ? 1 : 0 }}>_</span>
    </span>
  );
};

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    isActive ? 'text-gray-500 font-semibold' : 'text-gray-700 hover:text-gray-500 transition';

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
          <ul className="hidden md:flex space-x-6 text-sm font-medium">
            <li><NavLink to="/" className={linkClass}>Inicio</NavLink></li>
            <li><NavLink to="/search" className={linkClass}>Buscar Empleo</NavLink></li>
            <li><NavLink to="/about" className={linkClass}>Sobre nosotros</NavLink></li>
            <li><NavLink to="/contact" className={linkClass}>Contacto</NavLink></li>
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
            </ul>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;