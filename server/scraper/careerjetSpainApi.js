import axios from 'axios';

export async function getJobsFromCareerjetSpain(keyword, location = 'España', userIp, page = 1) {
  const affiliateId = process.env.API_KEY;
  const apiUrl = process.env.API_URL;

  const params = {
    aff_id: affiliateId,
    user_ip: userIp,
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    locale_code: 'es_ES',   // ← locale español
    location: location || 'España',
    keywords: keyword,
    page: page,
    sort: 'date',
    pagesize: 20,
  };

  try {
    const response = await axios.get(apiUrl, { params });
    const data = response.data;

    if ((data.type === 'JOBS' || data.type === 'OK') && data.hits > 0) {
      const jobs = data.jobs.map((job) => {
        let salary = 'No especificado';
        if (job.salary) {
          salary = job.salary;
        } else if (job.salary_min && job.salary_max) {
          salary = `${job.salary_min}€ - ${job.salary_max}€ ${job.salary_currency_code || ''}`.trim();
        } else if (job.salary_min) {
          salary = `Desde ${job.salary_min}€`.trim();
        } else if (job.salary_max) {
          salary = `Hasta ${job.salary_max}€`.trim();
        }

        return {
          title: job.title,
          company: job.company || 'No especificada',
          link: job.url,
          datePosted: job.date,
          location: job.locations || location,
          salary,
          jobType: job.contract || 'No especificado',
          description: job.description,
          source: 'Careerjet',
        };
      });

      return {
        jobs,
        hits: data.hits || 0,
        page,
        totalPages: Math.ceil(data.hits / 20),
      };
    } else {
      return { jobs: [], hits: 0, page, totalPages: 0 };
    }
  } catch (error) {
    console.error('Careerjet Spain API error:', error.message);
    throw new Error('Error al obtener empleos de Careerjet');
  }
}
