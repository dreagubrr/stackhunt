import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/stackhuntlogohelvetica.png';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    window.location.href = '/';
  };

  const linkClass = ({ isActive }) =>
    isActive
      ? 'text-gray-900 font-semibold'
      : 'text-gray-500 hover:text-gray-900 transition-colors duration-200';

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <nav
        style={{ fontFamily: "'Inter', sans-serif" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <NavLink to="/" className="flex items-center">
            <img src={logo} alt="StackHunt" style={{ height: '36px', width: 'auto' }} />
          </NavLink>

          {/* Desktop links */}
          <ul className="hidden md:flex items-center gap-8 text-sm font-medium">
            <li><NavLink to="/" className={linkClass}>Inicio</NavLink></li>
            <li><NavLink to="/search" className={linkClass}>Buscar Empleo</NavLink></li>
            <li><NavLink to="/about" className={linkClass}>Sobre nosotros</NavLink></li>
            <li><NavLink to="/contact" className={linkClass}>Contacto</NavLink></li>
            {user ? (
              <>
                <li>
                  <NavLink to="/profile"
                    className="text-gray-700 hover:text-gray-900 font-medium transition-colors">
                    {user.name.split(' ')[0]}
                  </NavLink>
                </li>
                <li>
                  <button onClick={handleLogout}
                    className="text-sm text-gray-400 hover:text-red-500 transition-colors">
                    Salir
                  </button>
                </li>
              </>
            ) : (
              <li>
                <NavLink to="/login"
                  className="bg-gray-900 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-gray-700 transition-colors">
                  Entrar →
                </NavLink>
              </li>
            )}
          </ul>

          {/* Mobile hamburger */}
          <button className="md:hidden text-gray-700" onClick={() => setMenuOpen(!menuOpen)}>
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
          <div className="md:hidden bg-white border-t border-gray-100 px-6 pb-6">
            <ul className="flex flex-col gap-4 text-sm font-medium pt-4">
              <li><NavLink to="/" className={linkClass} onClick={() => setMenuOpen(false)}>Inicio</NavLink></li>
              <li><NavLink to="/search" className={linkClass} onClick={() => setMenuOpen(false)}>Buscar Empleo</NavLink></li>
              <li><NavLink to="/about" className={linkClass} onClick={() => setMenuOpen(false)}>Sobre nosotros</NavLink></li>
              <li><NavLink to="/contact" className={linkClass} onClick={() => setMenuOpen(false)}>Contacto</NavLink></li>
              {user ? (
                <>
                  <li><NavLink to="/profile" className={linkClass} onClick={() => setMenuOpen(false)}>Mi perfil</NavLink></li>
                  <li><button onClick={handleLogout} className="text-red-500 text-left">Cerrar sesión</button></li>
                </>
              ) : (
                <li><NavLink to="/login" onClick={() => setMenuOpen(false)}
                  className="inline-block bg-gray-900 text-white px-5 py-2 rounded-full text-sm font-medium">
                  Entrar →
                </NavLink></li>
              )}
            </ul>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;