import { getJobsFromCareerjetSpain } from '../scraper/careerjetSpainApi.js';
import { scrapeTecnoempleo } from '../scraper/tecnoempleoScraper.js';
import { scrapeInfojobs } from '../scraper/infojobsScraper.js';
import { scrapeIndeedSpain } from '../scraper/indeedSpainScraper.js';

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
    res.status(500).json({ error: 'Error al obtener empleos', details: error.message });
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

// InfoJobs scraper
export const getInfojobsJobs = async (req, res) => {
  try {
    const { keyword, location } = req.query;
    if (!keyword) return res.status(400).json({ error: 'Se requiere keyword' });

    const jobs = await scrapeInfojobs(keyword, location || '');
    res.json({ jobs, hits: jobs.length, source: 'InfoJobs' });
  } catch (error) {
    console.error('InfoJobs controller error:', error.message);
    res.status(500).json({ error: 'Error al obtener empleos de InfoJobs', details: error.message });
  }
};

// Indeed España scraper
export const getIndeedSpainJobs = async (req, res) => {
  try {
    const { keyword, location } = req.query;
    if (!keyword) return res.status(400).json({ error: 'Se requiere keyword' });

    const jobs = await scrapeIndeedSpain(keyword, location || 'España');
    res.json({ jobs, hits: jobs.length, source: 'Indeed España' });
  } catch (error) {
    console.error('Indeed Spain controller error:', error.message);
    res.status(500).json({ error: 'Error al obtener empleos de Indeed España', details: error.message });
  }
};

// Agregador: busca en todas las fuentes a la vez
export const getAllSpainJobs = async (req, res) => {
  try {
    const { keyword, location } = req.query;
    if (!keyword) return res.status(400).json({ error: 'Se requiere keyword' });

    const results = await Promise.allSettled([
      scrapeTecnoempleo(keyword, location || ''),
      scrapeInfojobs(keyword, location || ''),
      scrapeIndeedSpain(keyword, location || 'España'),
    ]);

    const jobs = results
      .filter((r) => r.status === 'fulfilled')
      .flatMap((r) => r.value);

    // Sort by source for consistency
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
