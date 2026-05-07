import { scrapeTecnoempleo } from './scraper/tecnoempleoScraper.js';

const jobs = await scrapeTecnoempleo('react', 'madrid');
console.log('Total jobs:', jobs.length);
console.log('First 3 jobs:', JSON.stringify(jobs.slice(0, 3), null, 2));