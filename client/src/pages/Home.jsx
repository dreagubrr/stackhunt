import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import RemoteWorker from '../assets/remote-worker.svg';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="flex flex-col-reverse md:flex-row items-center max-w-7xl mx-auto px-6 py-16 gap-12"
      >
        <div className="md:w-1/2 text-center md:text-left">
          <h1 className="text-5xl font-extrabold text-gray-700 mb-6">
             {`if(StackHunt) { getJob() } else { keepSuffering() }`}
          </h1>
          <p className="text-gray-700 mb-8 text-lg max-w-md mx-auto md:mx-0">
            Ofertas de trabajo en tiempo real de InfoJobs, Tecnoempleo, Indeed España y Careerjet.
          </p>
          <NavLink
            to="/search"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition"
          >
            Buscar Empleo
          </NavLink>
        </div>
        <div className="md:w-1/2 max-w-md mx-auto">
          <img src={RemoteWorker} alt="Búsqueda de empleo" className="w-full" />
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="bg-white py-16 max-w-6xl mx-auto px-6"
      >
        <div className="grid sm:grid-cols-3 gap-10 text-center text-gray-700">
          <div>
            <h3 className="text-blue-600 text-xl font-semibold mb-3">Datos en Tiempo Real</h3>
            <p>Ofertas obtenidas al instante de los portales de empleo más usados en España.</p>
          </div>
          <div>
            <h3 className="text-blue-600 text-xl font-semibold mb-3">Múltiples Fuentes</h3>
            <p>InfoJobs, Tecnoempleo, Indeed España y Careerjet en una sola búsqueda.</p>
          </div>
          <div>
            <h3 className="text-blue-600 text-xl font-semibold mb-3">Búsqueda Inteligente</h3>
            <p>Filtra por puesto, ciudad, salario o modalidad de trabajo.</p>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default Home;
