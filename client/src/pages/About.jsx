import { motion } from 'framer-motion';

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4 py-16">
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl w-full bg-white shadow-md rounded-lg px-8 py-10"
      >
        <h2 className="text-3xl font-bold text-blue-700 mb-6 text-center">Sobre Job Miner</h2>

        <p className="text-gray-700 mb-4 text-lg">
          <strong>Job Miner España</strong> es una aplicación web fullstack que obtiene ofertas de empleo
          en tiempo real de los principales portales del mercado laboral español: InfoJobs, Tecnoempleo,
          Indeed España y Careerjet. El objetivo es ayudar a los profesionales a encontrar oportunidades
          laborales de forma rápida y centralizada.
        </p>

        <p className="text-gray-700 mb-6">
          El proyecto está construido con las siguientes tecnologías:
        </p>

        <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-8">
          <li>⚛️ React y Tailwind CSS para la interfaz de usuario</li>
          <li>🚀 Node.js y Express para el backend y la API REST</li>
          <li>🕸️ Cheerio para el scraping de portales de empleo</li>
          <li>🌐 Careerjet API con localización <code className="bg-gray-100 px-1 rounded">es_ES</code></li>
          <li>☁️ Desplegado en Netlify (frontend) y Render (backend)</li>
        </ul>

        <div className="bg-blue-50 rounded-lg p-4 text-sm text-gray-700 space-y-2">
          <p className="font-semibold text-blue-700 mb-2">¿Tienes alguna sugerencia o encuentras un error?</p>
          <p>Puedes ponerte en contacto con nosotros a través de la página de <a href="/contact" className="text-blue-600 hover:underline">Contacto</a>.</p>
        </div>
      </motion.section>
    </div>
  );
};

export default About;
