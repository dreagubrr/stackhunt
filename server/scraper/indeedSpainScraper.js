import axios from 'axios';
import * as cheerio from 'cheerio';

export async function scrapeIndeedSpain(keyword, location = 'España') {
  try {
    const encodedKeyword = encodeURIComponent(keyword);
    const encodedLocation = encodeURIComponent(location);
    const url = `https://es.indeed.com/jobs?q=${encodedKeyword}&l=${encodedLocation}&lang=es`;

    const { data } = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'es-ES,es;q=0.9',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        Referer: 'https://es.indeed.com/',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(data);
    const jobs = [];

    // Indeed Spain job cards
    $('div.job_seen_beacon, .jobsearch-ResultsList > li').each((i, el) => {
      const titleEl = $(el).find('h2.jobTitle a, a[data-jk]');
      const title = titleEl.find('span[title], span').first().text().trim() || titleEl.text().trim();
      const href = titleEl.attr('href');
      const link = href ? (href.startsWith('http') ? href : `https://es.indeed.com${href}`) : '';
      const company = $(el).find('[data-testid="company-name"], .companyName').first().text().trim();
      const locationText = $(el).find('[data-testid="text-location"], .companyLocation').first().text().trim();
      const salary = $(el).find('[data-testid="attribute_snippet_testid"], .salary-snippet-container').first().text().trim();
      const description = $(el).find('.job-snippet, [data-testid="jobsnippet_footer"]').text().trim();

      if (title && link) {
        jobs.push({
          title,
          company: company || 'No especificada',
          link,
          location: locationText || location,
          salary: salary || 'No especificado',
          datePosted: 'Reciente',
          jobType: 'No especificado',
          description,
          source: 'Indeed España',
        });
      }
    });

    return jobs;
  } catch (err) {
    console.error('Indeed Spain scraping error:', err.message);
    throw err;
  }
}
