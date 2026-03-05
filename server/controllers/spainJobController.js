import { getJobsFromCareerjetSpain } from '../scraper/careerjetSpainApi.js';
import { scrapeTecnoempleo } from '../scraper/tecnoempleoScraper.js';

// Careerjet España (paginado, requiere API key)
export const getCareerjetSpainJobs = async (req, res) => {
  try {
    const { keyword, location, page = 1 } = req.query;
    const user_ip =
      req.ip ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      '11.22.33.44';

    if (!keyword && !location) {
      return res.status(400).json({
        error: 'Se requiere al menos un parámetro de búsqueda (keyword o location)',
      });
    }

    const jobsData = await getJobsFromCareerjetSpain(keyword, location, user_ip, parseInt(page));
    res.json(jobsData);
  } catch (error) {
    console.error('Careerjet Spain controller error:', error.message);
    res.status(500).json({ error: 'Error al obtener empleos de Careerjet', details: error.message });
  }
};

// Tecnoempleo scraper
export const getTecnoempleoJobs = async (req, res) => {
  try {
    const { keyword, location } = req.query;
    if (!keyword) return res.status(400).json({ error: 'Se requiere keyword' });

    const jobs = await scrapeTecnoempleo(keyword, location || '');
    res.json({ jobs, hits: jobs.length, source: 'Tecnoempleo' });
  } catch (error) {
    console.error('Tecnoempleo controller error:', error.message);
    res.status(500).json({ error: 'Error al obtener empleos de Tecnoempleo', details: error.message });
  }
};

// Agregador: Tecnoempleo + Careerjet
export const getAllSpainJobs = async (req, res) => {
  try {
    const { keyword, location } = req.query;
    if (!keyword) return res.status(400).json({ error: 'Se requiere keyword' });

    const user_ip = req.ip || '11.22.33.44';

    const results = await Promise.allSettled([
      scrapeTecnoempleo(keyword, location || ''),
      getJobsFromCareerjetSpain(keyword, location || 'España', user_ip, 1)
        .then(data => data.jobs || []),
    ]);

    const jobs = results
      .filter((r) => r.status === 'fulfilled')
      .flatMap((r) => r.value);

    const sourcesAvailable = [...new Set(jobs.map((j) => j.source))];

    res.json({
      jobs,
      hits: jobs.length,
      sources: sourcesAvailable,
    });
  } catch (error) {
    console.error('Aggregator error:', error.message);
    res.status(500).json({ error: 'Error al agregar empleos', details: error.message });
  }
};
