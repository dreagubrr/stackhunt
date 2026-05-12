import * as cheerio from 'cheerio';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
  'Cache-Control': 'max-age=0',
};

async function fetchPage(url) {
  try {
    const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(15000) });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

async function fetchDescription(url) {
  try {
    const html = await fetchPage(url);
    if (!html) return '';
    const $ = cheerio.load(html);
    const desc = $('div.job-description, div#description, div.description, div.oferta-descripcion, div[itemprop="description"]')
      .first().text().replace(/\s+/g, ' ').trim()
      .replace(/^Descripción de la oferta de empleo\s*/i, '')
      .slice(0, 1000);
    return desc || '';
  } catch {
    return '';
  }
}

function parseJobs(html, location) {
  const $ = cheerio.load(html);
  const jobs = [];

  $('div.col-10.col-md-9.col-lg-7').each((i, el) => {
    const titleEl = $(el).find('h3.fs-5 a, a.font-weight-bold');
    const title = titleEl.first().text().trim();
    const link = titleEl.first().attr('href');
    const company = $(el).find('a.text-primary.link-muted').first().text().trim();
    const locationText = $(el).find('span.d-block.d-lg-none').find('b').first().text().trim();
    const snippet = $(el).find('span.hidden-md-down.text-gray-800').text().replace(/\s+/g, ' ').trim().slice(0, 300);
    const fullText = $(el).text().replace(/\s+/g, ' ');

    const dateMatch = fullText.match(/\d{2}\/\d{2}\/\d{4}/);
    const datePosted = dateMatch ? dateMatch[0] : 'Reciente';

    const cleanText = fullText.replace(/\d{2}\/\d{2}\/\d{4}/g, ' ');
    const salaryMatch = cleanText.match(/[\d.]+\s*€\s*[-–]\s*[\d.]+\s*€(?:\s*(?:b\/a|Bruto\/año|bruto))?/i);
    const salary = salaryMatch ? salaryMatch[0].trim() : 'No especificado';

    if (title && link) {
      jobs.push({
        title,
        company: company || 'No especificada',
        link: link.startsWith('http') ? link : `https://www.tecnoempleo.com${link}`,
        location: locationText || location || 'España',
        salary,
        datePosted,
        jobType: 'No especificado',
        description: snippet,
        source: 'Tecnoempleo',
      });
    }
  });

  return jobs;
}

export async function scrapeTecnoempleo(keyword, location = '') {
  try {
    const searchParams = new URLSearchParams({
      te: keyword,
      tp: location,
      btn_buscar: 'Buscar',
    });

    const baseUrl = `https://www.tecnoempleo.com/busqueda-empleo.php?${searchParams}`;
    const page2Url = `${baseUrl}&pagina=2`;

    const [html1, html2] = await Promise.all([
      fetchPage(baseUrl),
      fetchPage(page2Url),
    ]);

    const jobs1 = html1 ? parseJobs(html1, location) : [];
    const jobs2 = html2 ? parseJobs(html2, location) : [];

    const seen = new Set();
    const allJobs = [...jobs1, ...jobs2].filter(job => {
      if (seen.has(job.link)) return false;
      seen.add(job.link);
      return true;
    });

    // Fetch full descriptions for top 10 jobs in parallel (limited to avoid rate limiting)
    const TOP_N = 10;
    const topJobs = allJobs.slice(0, TOP_N);
    const restJobs = allJobs.slice(TOP_N);

    const descriptions = await Promise.allSettled(
      topJobs.map(job => fetchDescription(job.link))
    );

    topJobs.forEach((job, i) => {
      const result = descriptions[i];
      if (result.status === 'fulfilled' && result.value) {
        job.description = result.value;
      }
    });

    return [...topJobs, ...restJobs];

  } catch (err) {
    console.error('Tecnoempleo scraping error:', err.message);
    throw err;
  }
}