import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-8xl font-extrabold text-blue-200 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Página no encontrada</h2>
        <p className="text-gray-500 mb-8">Lo sentimos, la página que buscas no existe.</p>
        <Link
          to="/"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Volver al inicio
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
