import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import * as cheerio from 'cheerio';

puppeteer.use(StealthPlugin());

async function scrapePage(browser, url) {
  const page = await browser.newPage();
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'
  );
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 20000 });
    await page.waitForSelector('div.col-10.col-md-9.col-lg-7', { timeout: 10000 });
    const html = await page.content();
    await page.close();
    return html;
  } catch {
    await page.close();
    return null;
  }
}

async function scrapeFullDescription(browser, url) {
  const page = await browser.newPage();
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'
  );
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
    const html = await page.content();
    await page.close();
    const $ = cheerio.load(html);
    // Tecnoempleo job description container
    const desc = $('div.job-description, div#description, div.description, div.oferta-descripcion, div[itemprop="description"]')
  .first().text().replace(/\s+/g, ' ').trim()
  .replace(/^Descripción de la oferta de empleo\s*/i, '') // quitar el prefijo
  .slice(0, 1000);
    return desc || '';
  } catch {
    await page.close();
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
    const descriptionEl = $(el).find('span.hidden-md-down.text-gray-800');
    const snippet = descriptionEl.text().replace(/\s+/g, ' ').trim().slice(0, 300);
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
  let browser;
  try {
    const searchParams = new URLSearchParams({
      te: keyword,
      tp: location,
      btn_buscar: 'Buscar',
    });

    const baseUrl = `https://www.tecnoempleo.com/busqueda-empleo.php?${searchParams}`;
    const page2Url = `${baseUrl}&pagina=2`;

    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    // Scrape listing pages in parallel
    const [html1, html2] = await Promise.all([
      scrapePage(browser, baseUrl),
      scrapePage(browser, page2Url),
    ]);

    const jobs1 = html1 ? parseJobs(html1, location) : [];
    const jobs2 = html2 ? parseJobs(html2, location) : [];

    // Deduplicate
    const seen = new Set();
    const allJobs = [...jobs1, ...jobs2].filter(job => {
      if (seen.has(job.link)) return false;
      seen.add(job.link);
      return true;
    });

    // Fetch full description for top 15 jobs only
    const TOP_N = 15;
    const topJobs = allJobs.slice(0, TOP_N);
    const restJobs = allJobs.slice(TOP_N);

    const fullDescriptions = await Promise.allSettled(
      topJobs.map(job => scrapeFullDescription(browser, job.link))
    );

    topJobs.forEach((job, i) => {
      const result = fullDescriptions[i];
      if (result.status === 'fulfilled' && result.value) {
        job.description = result.value;
      }
    });

    await browser.close();

    return [...topJobs, ...restJobs];

  } catch (err) {
    if (browser) await browser.close();
    console.error('Tecnoempleo scraping error:', err.message);
    throw err;
  }
}