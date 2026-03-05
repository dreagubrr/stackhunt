import axios from 'axios';
import * as cheerio from 'cheerio';

export async function scrapeTecnoempleo(keyword, location = '') {
  try {
    const params = new URLSearchParams({
      te: keyword,
      tp: location,
      btn_buscar: 'Buscar',
    });

    const url = `https://www.tecnoempleo.com/busqueda-empleo.php?${params}`;

    const { data } = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'es-ES,es;q=0.9',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        Referer: 'https://www.tecnoempleo.com/',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(data);
    const jobs = [];

    // Tecnoempleo job cards
    $('div.col-10.col-md-9').each((i, el) => {
      const titleEl = $(el).find('h3.fs-5 a, a.font-weight-bold');
      const title = titleEl.first().text().trim();
      const link = titleEl.first().attr('href');
      const company = $(el).find('a.text-primary.link-muted').first().text().trim();
      const locationText = $(el).find('span.d-none.d-md-inline').first().text().trim();
      const salary = $(el).find('b.text-success, span.text-success').first().text().trim();
      const dateText = $(el).find('span.text-muted').last().text().trim();

      if (title && link) {
        jobs.push({
          title,
          company: company || 'No especificada',
          link: link.startsWith('http') ? link : `https://www.tecnoempleo.com${link}`,
          location: locationText || location || 'España',
          salary: salary || 'No especificado',
          datePosted: dateText || 'Reciente',
          jobType: 'No especificado',
          description: '',
          source: 'Tecnoempleo',
        });
      }
    });

    return jobs;
  } catch (err) {
    console.error('Tecnoempleo scraping error:', err.message);
    throw err;
  }
}
