import axios from 'axios';
import * as cheerio from 'cheerio';

export async function scrapeInfojobs(keyword, location = '') {
  try {
    // Build InfoJobs search URL
    const encodedKeyword = encodeURIComponent(keyword);
    const encodedLocation = location ? encodeURIComponent(location) : '';
    const url = location
      ? `https://www.infojobs.net/jobsearch/search-results/list.xhtml?keyword=${encodedKeyword}&provinceIds=&normalizedJobName=${encodedKeyword}&normalizedLocation=${encodedLocation}`
      : `https://www.infojobs.net/jobsearch/search-results/list.xhtml?keyword=${encodedKeyword}`;

    const { data } = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'es-ES,es;q=0.9',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        Referer: 'https://www.infojobs.net/',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(data);
    const jobs = [];

    // InfoJobs uses data attributes on offer cards
    $('li[data-id], .ij-OfferCardContent').each((i, el) => {
      const titleEl = $(el).find('a[data-testid="offer-description-title"], h2 a, .ij-OfferCardContent-description-title a');
      const title = titleEl.first().text().trim();
      const link = titleEl.first().attr('href');
      const company = $(el).find('[data-testid="offer-description-company"], .ij-OfferCardContent-description-subtitle').first().text().trim();
      const locationText = $(el).find('[data-testid="offer-description-location"], .ij-OfferCardContent-description-footer-item').first().text().trim();
      const salary = $(el).find('[data-testid="offer-salary"], .ij-OfferCardContent-description-salary').first().text().trim();

      if (title && link) {
        jobs.push({
          title,
          company: company || 'No especificada',
          link: link.startsWith('http') ? link : `https://www.infojobs.net${link}`,
          location: locationText || location || 'España',
          salary: salary || 'No especificado',
          datePosted: 'Reciente',
          jobType: 'No especificado',
          description: '',
          source: 'InfoJobs',
        });
      }
    });

    return jobs;
  } catch (err) {
    console.error('InfoJobs scraping error:', err.message);
    throw err;
  }
}
