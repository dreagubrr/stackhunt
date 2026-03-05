import { motion } from 'framer-motion';

const SavedJobs = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="text-5xl mb-4">🔖</div>
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Ofertas guardadas</h2>
        <p className="text-gray-500">Esta funcionalidad estará disponible próximamente.</p>
      </motion.div>
    </div>
  );
};

export default SavedJobs;
