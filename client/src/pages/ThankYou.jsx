import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const ThankYou = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4">
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-lg shadow-md max-w-lg w-full p-8 text-center"
      >
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-3xl font-bold text-blue-700 mb-4">¡Mensaje enviado!</h2>
        <p className="text-gray-600 mb-6">
          Hemos recibido tu mensaje. Te responderemos lo antes posible.
        </p>
        <Link
          to="/"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition font-semibold"
        >
          Volver al inicio
        </Link>
      </motion.section>
    </div>
  );
};

export default ThankYou;
