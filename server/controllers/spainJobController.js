import { scrapeTecnoempleo } from '../scraper/tecnoempleoScraper.js';
import { getJoobleJobs as fetchJoobleJobs } from '../scraper/joobleApi.js';
import { getAdzunaJobs } from '../scraper/adzunaApi.js';

// Tecnoempleo
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

// Jooble
export const getJoobleJobs = async (req, res) => {
  try {
    const { keyword, location } = req.query;
    if (!keyword) return res.status(400).json({ error: 'Se requiere keyword' });

    const jobs = await fetchJoobleJobs(keyword, location || 'España');
    res.json({ jobs, hits: jobs.length, source: 'Jooble' });
  } catch (error) {
    console.error('Jooble controller error:', error.message);
    res.status(500).json({ error: 'Error al obtener empleos de Jooble', details: error.message });
  }
};

// Adzuna
export const getAdzunaJobsController = async (req, res) => {
  try {
    const { keyword, location } = req.query;
    if (!keyword) return res.status(400).json({ error: 'Se requiere keyword' });

    const jobs = await getAdzunaJobs(keyword, location || 'españa');
    res.json({ jobs, hits: jobs.length, source: 'Adzuna' });
  } catch (error) {
    console.error('Adzuna controller error:', error.message);
    res.status(500).json({ error: 'Error al obtener empleos de Adzuna', details: error.message });
  }
};

// Todas las fuentes
export const getAllSpainJobs = async (req, res) => {
  try {
    const { keyword, location } = req.query;
    if (!keyword) return res.status(400).json({ error: 'Se requiere keyword' });

    const results = await Promise.allSettled([
      scrapeTecnoempleo(keyword, location || ''),
      fetchJoobleJobs(keyword, location || 'España'),
      getAdzunaJobs(keyword, location || 'españa'),
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